/* DIAGNOSTIC: Force re-compile to resolve 404 ghost routes */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { optimizeResumeContent } from "@/lib/gemini";
import mammoth from "mammoth";
import PizZip from "pizzip";
import fs from "fs/promises";
import path from "path";
import { checkUsageLimit, incrementUsage } from "@/lib/usage";


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // --- RESUME OPTIMIZATION ACTION ---
    if (body.action === 'optimize') {
      const usage = await checkUsageLimit(session.user.email, 'optimization');
      if (!usage.allowed) {
        return NextResponse.json({ 
          error: "Limit Reached", 
          message: `You've used all ${usage.limit} optimizations for this month. Upgrade to Elite for more power.`,
          code: "LIMIT_REACHED"
        }, { status: 403 });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });


      if (!user || !user.resumePath) {
        return NextResponse.json({ error: "No resume found. Please upload one in your profile." }, { status: 404 });
      }

      const jobDescription = body.jobDescription;
      const jobTitle = body.jobTitle || "Unknown Job";
      if (!jobDescription) {
        return NextResponse.json({ error: "Missing job description" }, { status: 400 });
      }

      console.log(`Optimization Step 0: Starting optimization for [${jobTitle}]`);
      console.log("JD Snapshot:", jobDescription.substring(0, 150) + "...");

      // 1. Fetch resume buffer
      console.log("Optimization Step 1: Fetching resume buffer from", user.resumePath);
      let resumeBuffer: Buffer;
      try {
        if (user.resumePath.startsWith("http")) {
          const res = await fetch(user.resumePath);
          if (!res.ok) throw new Error(`Failed to fetch remote resume: ${res.statusText}`);
          const arrayBuffer = await res.arrayBuffer();
          resumeBuffer = Buffer.from(arrayBuffer);
        } else {
          const fileName = path.basename(user.resumePath);
          const filePath = path.join(process.cwd(), "storage/resumes", fileName);
          resumeBuffer = await fs.readFile(filePath);
        }
      } catch (err: any) {
        console.error("File Read Error:", err.message);
        return NextResponse.json({ error: `Resume file not found or inaccessible. Please re-upload your resume. (${err.message})` }, { status: 404 });
      }

    // 2. Extract raw text for AI
    console.log("Optimization Step 2: Extracting text from document");
    let resumeText: string;
    try {
      const extracted = await mammoth.extractRawText({ buffer: resumeBuffer });
      resumeText = extracted.value;
      console.log("RAW EXTRACTED TEXT (First 500 chars):", resumeText.substring(0, 500));
    } catch (err: any) {
      return NextResponse.json({ error: "Failed to extract text from your resume." }, { status: 422 });
    }

    // 3. Get AI Optimization
    console.log("Optimization Step 3: Calling AI Engine");
    const opt = await optimizeResumeContent(resumeText, jobDescription);
    
    if (!opt || (!opt.originalSummary && opt.originalSummary !== "NO_CHANGES_REQUIRED_FALLBACK_PLACEHOLDER")) {
      console.error("AI Mapping Error: Summary missing", opt);
      return NextResponse.json({ error: "AI failed to analyze your resume. Please try again in a moment." }, { status: 422 });
    }

      // 4. Surgical XML Replacement
      console.log("Optimization Step 4: Performing surgical XML replacement");
      const zip = new PizZip(resumeBuffer);
      let xml = zip.file("word/document.xml")?.asText();

      if (!xml) throw new Error("Could not read document XML");

      const createSurgicalRegex = (text: string) => {
        const pattern = text.split('').map((c, i) => {
          const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (i < text.length - 1) {
            return `${escaped}(?:(?!<\/w:p>)<[^>]+>|\\s)*?`;
          }
          return escaped;
        }).join('');
        
        // Capture the start-tag/prefix, the pattern match, and the suffix/end-tag
        return new RegExp(`(<w:t[^>]*>[^<]*?)(${pattern})([^<]*?<\/w:t>)`, 'g');
      };

      const xmlEscape = (str: string) => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const isFallback = opt.originalSummary === "NO_CHANGES_REQUIRED_FALLBACK_PLACEHOLDER";

      if (!isFallback && opt.originalSummary && opt.newSummary && opt.originalSummary !== opt.newSummary) {
        console.log("Searching for summary match (Surgical)...");
        const summaryRegex = createSurgicalRegex(opt.originalSummary);
        
        let matchFound = false;
        xml = xml.replace(summaryRegex, (fullMatch, prefix, match, suffix) => {
          if (matchFound) return fullMatch; 
          matchFound = true;
          console.log(`SUCCESS: Match found for summary!`);
          return `${prefix}${xmlEscape(opt.newSummary)}${suffix}`;
        });

        if (!matchFound) {
          console.warn("WARNING: No match found for summary.");
        }
      }

      // Replace Bullets
      if (opt.bulletReplacements && opt.bulletReplacements.length > 0) {
        console.log(`Optimization Step 5: Processing ${opt.bulletReplacements.length} bullets`);
        for (const [bIdx, replacement] of opt.bulletReplacements.entries()) {
          if (replacement.original && replacement.new && replacement.original !== replacement.new) {
            const bulletRegex = createSurgicalRegex(replacement.original);
            let bMatchFound = false;

            xml = xml.replace(bulletRegex, (fullMatch, prefix, match, suffix) => {
              if (bMatchFound) return fullMatch;
              bMatchFound = true;
              console.log(`  - Bullet ${bIdx + 1}: Match replaced.`);
              return `${prefix}${xmlEscape(replacement.new)}${suffix}`;
            });
          }
        }
      }

      // 5. Re-zip and return
      zip.file("word/document.xml", xml);
      const outputBuffer = zip.generate({ type: "nodebuffer" });

      const finalFilename = `Optimized_Resume_${Date.now()}.docx`;
      console.log(`Optimization Complete: Sending ${finalFilename} (${outputBuffer.length} bytes)`);

      // Track usage
      await incrementUsage(session.user.email, 'optimization');

      return new Response(new Uint8Array(outputBuffer), {

        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${finalFilename}"`,
        },
      });
    }

    // --- ORIGINAL SEARCH ACTION ---
    const usage = await checkUsageLimit(session.user.email, 'scan');
    if (!usage.allowed) {
      return NextResponse.json({ 
        error: "Limit Reached", 
        message: `You've used your ${usage.limit} daily scans. Elite members get 25.`,
        code: "LIMIT_REACHED"
      }, { status: 403 });
    }

    const page = parseInt(body.page) || 0;
    const startOffset = page * 30;


    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const title = user?.jobTitle?.trim() || "Product Designer";
    const location = user?.location?.trim() || "Remote";

    const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

    if (!SERPAPI_KEY) {
      const fallbackJobs = [
        {
          id: "mock-" + Math.random().toString(36).substr(2, 9),
          title: `Senior ${title}`,
          company: "TechNova Inc.",
          location: location,
          description: `We are looking for a highly skilled ${title} to join our team.`,
          matchScore: 92,
          applyLink: "#",
          status: "WISHLIST",
          userId: user?.id
        }
      ];
      return NextResponse.json({ jobs: fallbackJobs });
    }

    const query = encodeURIComponent(title);
    const searchLocation = location.toLowerCase() === "remote" ? "United States" : encodeURIComponent(location);
    
    // 1. Handle Remote Logic
    // If the user toggled 'remoteOnly' OR their profile location is 'Remote'
    const isRemote = body.remoteOnly || location.toLowerCase() === "remote";
    const remoteParam = isRemote ? "&ltype=1" : "";
    
    // 2. Handle Job Type Chips
    // Mapping: fulltime -> jt:fulltime, contract -> jt:contract, etc.
    let chipsParam = "";
    if (body.jobType) {
      const typeMap: Record<string, string> = {
        fulltime: "jt:fulltime",
        contract: "jt:contract",
        internship: "jt:internship"
      };
      const chip = typeMap[body.jobType as string];
      if (chip) {
        chipsParam = `&chips=${encodeURIComponent(chip)}`;
      }
    }
    
    const fetchJobs = async (start: number) => {
      const url = `https://serpapi.com/search.json?engine=google_jobs&q=${query}&location=${searchLocation}&gl=us&hl=en&start=${start}&api_key=${SERPAPI_KEY}${remoteParam}${chipsParam}`;
      const res = await fetch(url);
      if (!res.ok) return { jobs_results: [] };
      return res.json();
    };

    const results = await Promise.all([
      fetchJobs(startOffset),
      fetchJobs(startOffset + 10),
      fetchJobs(startOffset + 20),
      fetchJobs(startOffset + 30),
      fetchJobs(startOffset + 40)
    ]);

    const allJobsResults = results.flatMap(r => r.jobs_results || []);

    if (allJobsResults.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    if (user) {
      const uniqueResults = Array.from(new Map(allJobsResults.map(item => [item.job_id, item])).values());
      
      const cleanDescription = (desc: string) => {
        if (!desc) return "";
        // 1. Remove common junk headers at the very start
        const junkPatterns = [
          /^Description:?\s*/i,
          /^Job Description:?\s*/i,
          /^Role Summary:?\s*/i,
          /^About the Role:?\s*/i,
          /^About the Company:?\s*/i,
          /^Summary:?\s*/i,
          /^Overview:?\s*/i,
          /^Position Summary:?\s*/i
        ];
        
        let cleaned = desc.trim();
        for (const pattern of junkPatterns) {
          cleaned = cleaned.replace(pattern, "");
        }
        
        // 2. Remove leading symbols/noise that often remain
        cleaned = cleaned.replace(/^[•\-–\s\r\n*]+/, "");
        
        return cleaned.substring(0, 500) + "...";
      };

      const savedJobs = await Promise.all(uniqueResults.slice(0, 50).map(async (job) => {
        const jobId = job.job_id || Math.random().toString(36).substr(2, 9);
        const jobLocation = job.location || location;
        const mappedJob = {
          id: jobId,
          title: job.title || title,
          company: job.company_name || "Unknown Company",
          location: jobLocation.toLowerCase().includes("anywhere") ? "Remote" : jobLocation,
          description: cleanDescription(job.description || "No description provided."),
          matchScore: Math.floor(Math.random() * (98 - 85 + 1)) + 85,
          applyLink: job.apply_options?.[0]?.link || "#",
          status: "WISHLIST",
          userId: user.id
        };

        return prisma.job.upsert({
          where: { id: jobId },
          update: {
            title: mappedJob.title,
            company: mappedJob.company,
            location: mappedJob.location,
            description: mappedJob.description,
            matchScore: mappedJob.matchScore,
            applyLink: mappedJob.applyLink
          },
          create: {
            id: mappedJob.id,
            title: mappedJob.title,
            company: mappedJob.company,
            location: mappedJob.location,
            description: mappedJob.description,
            matchScore: mappedJob.matchScore,
            applyLink: mappedJob.applyLink,
            status: "WISHLIST",
            userId: user.id
          }
        });
      }));

      // Track usage
      await incrementUsage(session.user.email, 'scan');

      return NextResponse.json({ jobs: savedJobs });

    }

    return NextResponse.json({ jobs: [] });
  } catch (error: any) {
    console.error("Critical Route Error:", error);
    return NextResponse.json({ error: "Operation failed", details: error.message }, { status: 500 });
  }
}
