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

export const dynamic = 'force-dynamic';

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

      const getCharPattern = (c: string) => {
        // Escape special regex characters
        const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // If it's a non-alphanumeric character (like a space or hyphen), 
        // we match any non-alphanumeric character OR any XML tag
        if (/[^a-zA-Z0-9]/.test(c)) return `(?:[^a-zA-Z0-9]|<[^>]+>)*?`;
        
        // Otherwise, match the character itself but allow interleaving tags (for bolding/styles)
        return escaped;
      };

      const createSurgicalRegex = (text: string) => {
        // 2. Normalize and split into words to allow flexible whitespace between them
        const words = text.trim().split(/\s+/);
        
        const pattern = words.map((word) => {
          // For each word, allow tags BETWEEN characters (in case of bolding/formatting)
          return word.split('').map(c => getCharPattern(c)).join('(?:<[^>]+>)*?');
        }).join('(?:<[^>]+>|\\s)+?'); // Allow tags OR any whitespace between words
        
        return new RegExp(pattern, 'gi'); // Case-insensitive matching
      };

      const xmlEscape = (str: string) => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const stripMarkdown = (text: string) => text.replace(/[*_~`]/g, '');
      
      const cleanAnchor = (text: string) => {
        return stripMarkdown(text)
          .replace(/^(PROFESSIONAL\s+)?SUMMARY:?\s*/i, '')
          .replace(/^(PROFESSIONAL\s+)?EXPERIENCE:?\s*/i, '')
          .replace(/^(CORE\s+)?SKILLS:?\s*/i, '')
          .trim()
          .substring(0, 30);
      };

       if (opt.newSummary) {
        console.log("Surgical Injection: Ironclad Map active...");
        
        const paragraphs = xml.split("</w:p>");
        
        const trace = paragraphs.slice(0, 30).map((p, i) => `Para ${i}: ${p.replace(/<[^>]+>/g, "").trim()}`).join("\n");
        // Log removed for production
        
        const headers: { [key: string]: number } = {};
        
        // 1. Map every header in the document (Fuzzy match for XML tags inside headers)
        for (let i = 0; i < paragraphs.length; i++) {
          const cleanText = paragraphs[i].replace(/<[^>]+>/g, "").trim();
          if (/PROFESSIONAL\s+SUMMARY/i.test(cleanText)) headers['summary'] = i;
          if (/TECHNICAL\s+SKILLS/i.test(cleanText)) headers['skills'] = i;
          if (/PROFESSIONAL\s+EXPERIENCE/i.test(cleanText)) headers['experience'] = i;
          if (/EDUCATION/i.test(cleanText)) headers['education'] = i;
          if (/CERTIFICATIONS/i.test(cleanText)) headers['certifications'] = i;
        }

        // Landmark logging removed for production

        if (headers['summary'] !== undefined) {
          const nextHeaderIdx = headers['skills'] ?? headers['experience'] ?? headers['education'] ?? paragraphs.length;
          
          // Capture original formatting
          const targetPara = paragraphs[headers['summary'] + 1] || paragraphs[headers['summary']];
          const pPrMatch = targetPara.match(/<w:pPr>.*?<\/w:pPr>/);
          const pPr = pPrMatch ? pPrMatch[0] : '<w:pPr><w:jc w:val="both"/></w:pPr>';

          const before = paragraphs.slice(0, headers['summary'] + 1);
          const after = paragraphs.slice(nextHeaderIdx);
          
          const newSummaryPara = `<w:p>${pPr}<w:r><w:t>${xmlEscape(opt.newSummary)}</w:t></w:r></w:p>`;
          
          xml = before.join("</w:p>") + "</w:p>" + newSummaryPara + after.join("</w:p>");
          console.log("FORTRESS: Summary section locked and updated.");
        }
      }

      // 4b. Re-map for bullets (ensures we are working with the fresh XML)
      const freshParas = xml.split("</w:p>");
      const freshHeaders: { [key: string]: number } = {};
      for (let i = 0; i < freshParas.length; i++) {
        const cleanText = freshParas[i].replace(/<[^>]+>/g, "").trim();
        if (/PROFESSIONAL\s+EXPERIENCE/i.test(cleanText)) freshHeaders['experience'] = i;
        if (/EDUCATION/i.test(cleanText)) freshHeaders['education'] = i;
      }

      // Replace Bullets ONLY inside the Experience section
      if (opt.bulletReplacements && opt.bulletReplacements.length > 0 && freshHeaders['experience'] !== undefined) {
        const expStart = freshHeaders['experience'];
        const expEnd = freshHeaders['education'] || freshParas.length;
        
        console.log(`FORTRESS: Experience Section locked between ${expStart} and ${expEnd}`);
        
        const expParas = freshParas.slice(expStart, expEnd);
        let expXml = expParas.join("</w:p>") + "</w:p>";

        for (const [bIdx, replacement] of opt.bulletReplacements.entries()) {
          if (replacement.original && replacement.new && replacement.original !== replacement.new) {
            const bAnchor = cleanAnchor(replacement.original);
            const bRegex = createSurgicalRegex(bAnchor);
            
            if (bRegex.test(expXml)) {
              console.log(`  - Bullet ${bIdx + 1}: Found inside Experience Fortress. Replacing text only.`);
              expXml = expXml.replace(bRegex, `<w:t>${xmlEscape(replacement.new)}</w:t>`);
            }
          }
        }

        // Stitch the document back together
        const beforeExp = freshParas.slice(0, expStart);
        const afterExp = freshParas.slice(expEnd);
        xml = beforeExp.join("</w:p>") + "</w:p>" + expXml + afterExp.join("</w:p>");
      }

      // 5. Re-zip and return
      zip.file("word/document.xml", xml);
      
      // --- FINAL DEBUG REMOVED ---

      const outputBuffer = zip.generate({ type: "nodebuffer" });

      const finalFilename = `Optimized_Resume_${Date.now()}.docx`;
      console.log(`Optimization Complete: Sending ${finalFilename} (${outputBuffer.length} bytes)`);

      // Track usage
      await incrementUsage(session.user.email, 'optimization');

      return new Response(new Uint8Array(outputBuffer), {

        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${finalFilename}"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
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

    const isRemoteOnly = body.remoteOnly === true;
    const isRemoteKeyword = location.toLowerCase() === "remote";
    const isUSA = location.toLowerCase() === "usa" || location.toLowerCase() === "united states";
    
    // For specific cities, we use the official filter. For USA/Broad, we use keywords.
    const useKeywordStrategy = isUSA || isRemoteKeyword;
    
    const query = encodeURIComponent(title + (useKeywordStrategy && isRemoteOnly ? " Remote" : ""));
    const searchLocation = (isUSA || isRemoteKeyword) ? "USA" : encodeURIComponent(location);
    const remoteParam = (isRemoteOnly && !useKeywordStrategy) ? "&ltype=1" : "";
    
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
