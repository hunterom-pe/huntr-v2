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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // --- RESUME OPTIMIZATION ACTION ---
    if (body.action === 'optimize') {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user || !user.resumePath) {
        return NextResponse.json({ error: "No resume found. Please upload one in your profile." }, { status: 404 });
      }

      const jobDescription = body.jobDescription;
      if (!jobDescription) {
        return NextResponse.json({ error: "Missing job description" }, { status: 400 });
      }

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
      } catch (err: any) {
        return NextResponse.json({ error: "Failed to extract text from your resume." }, { status: 422 });
      }

      // 3. Get AI Optimization
      console.log("Optimization Step 3: Calling AI Engine");
      const opt = await optimizeResumeContent(resumeText, jobDescription);
      
      if (!opt || !opt.originalSummary || !opt.newSummary) {
        return NextResponse.json({ error: "AI failed to analyze your resume structure." }, { status: 422 });
      }

      // 4. Surgical XML Replacement
      console.log("Optimization Step 4: Performing surgical XML replacement");
      const zip = new PizZip(resumeBuffer);
      let xml = zip.file("word/document.xml")?.asText();

      if (!xml) throw new Error("Could not read document XML");

      const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const createSurgicalRegex = (text: string) => {
        // Ultimate fuzzy: Allow any amount of whitespace, newlines, or XML tags between every single character
        return new RegExp(text.split('').map(c => escapeRegExp(c)).join('[\\s\\n\\r]*(<[^>]+>)*[\\s\\n\\r]*'), 'g');
      };

      console.log("Searching for summary match:", opt.originalSummary.substring(0, 50) + "...");
      console.log("Document XML Snapshot:", xml.substring(0, 300));

      // Replace Summary
      const summaryRegex = createSurgicalRegex(opt.originalSummary);
      const match = xml.match(summaryRegex);
      if (match) {
        console.log("SUCCESS: Match found for summary! Replacing...");
        xml = xml.replace(summaryRegex, opt.newSummary);
      } else {
        console.warn("WARNING: No match found for summary. Surgical replacement skipped.");
      }

      // Replace Bullets
      if (opt.bulletReplacements) {
        for (const replacement of opt.bulletReplacements) {
          if (replacement.original && replacement.new) {
            const bulletRegex = createSurgicalRegex(replacement.original);
            if (xml.match(bulletRegex)) {
              xml = xml.replace(bulletRegex, replacement.new);
            }
          }
        }
      }

      // 5. Re-zip and return
      zip.file("word/document.xml", xml);
      const outputBuffer = zip.generate({ type: "nodebuffer" });

      return new Response(new Uint8Array(outputBuffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="HUNTR_Optimized_Resume.docx"`,
        },
      });
    }

    // --- ORIGINAL SEARCH ACTION ---
    const page = parseInt(body.page) || 0;
    const startOffset = page * 30;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const title = user?.jobTitle || "Product Designer";
    const location = user?.location || "Remote";

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
    const remoteParam = location.toLowerCase() === "remote" ? "&ltype=1" : "";
    
    const fetchJobs = async (start: number) => {
      const url = `https://serpapi.com/search.json?engine=google_jobs&q=${query}&location=${searchLocation}&gl=us&hl=en&start=${start}&api_key=${SERPAPI_KEY}${remoteParam}`;
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
      
      const savedJobs = await Promise.all(uniqueResults.slice(0, 50).map(async (job) => {
        const jobId = job.job_id || Math.random().toString(36).substr(2, 9);
        const jobLocation = job.location || location;
        const mappedJob = {
          id: jobId,
          title: job.title || title,
          company: job.company_name || "Unknown Company",
          location: jobLocation.toLowerCase().includes("anywhere") ? "Remote" : jobLocation,
          description: job.description ? job.description.substring(0, 500) + "..." : "No description provided.",
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

      return NextResponse.json({ jobs: savedJobs });
    }

    return NextResponse.json({ jobs: [] });
  } catch (error: any) {
    console.error("Critical Route Error:", error);
    return NextResponse.json({ error: "Operation failed", details: error.message }, { status: 500 });
  }
}
