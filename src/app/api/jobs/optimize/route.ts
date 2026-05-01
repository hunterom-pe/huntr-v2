import { NextResponse } from "next/server";
import { optimizeResumeContent } from "@/lib/gemini";
import mammoth from "mammoth";
import PizZip from "pizzip";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.resumePath) {
      return NextResponse.json({ error: "No resume found. Please upload one in your profile." }, { status: 404 });
    }

    const formData = await req.formData();
    const jobDescription = formData.get("jobDescription") as string;

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
        console.log("Attempting to read local file:", filePath);
        resumeBuffer = await fs.readFile(filePath);
      }
    } catch (err: any) {
      console.error("File Read Error:", err.message);
      return NextResponse.json({ error: `Resume file not found or inaccessible. Please re-upload your resume in Profile Settings. (${err.message})` }, { status: 404 });
    }

    // 2. Extract raw text for AI
    console.log("Optimization Step 2: Extracting text from document");
    let resumeText: string;
    try {
      const extracted = await mammoth.extractRawText({ buffer: resumeBuffer });
      resumeText = extracted.value;
      if (!resumeText || resumeText.trim().length < 50) {
        throw new Error("Extracted text is too short or empty");
      }
    } catch (err: any) {
      console.error("Text Extraction Error:", err.message);
      return NextResponse.json({ error: "Failed to extract text from your resume. Ensure it is a valid .docx file." }, { status: 422 });
    }

    // 3. Get AI Optimization
    console.log("Optimization Step 3: Calling AI Engine");
    const opt = await optimizeResumeContent(resumeText, jobDescription);
    
    if (!opt || !opt.originalSummary || !opt.newSummary) {
      console.error("AI Mapping Error: Missing summary fields", opt);
      return NextResponse.json({ error: "AI failed to analyze your resume structure. Try updating your resume summary to be more distinct." }, { status: 422 });
    }

    // 4. Surgical XML Replacement
    console.log("Optimization Step 4: Performing surgical XML replacement");
    const zip = new PizZip(resumeBuffer);
    let xml = zip.file("word/document.xml")?.asText();

    if (!xml) throw new Error("Could not read document XML");

    console.log("Attempting surgical replacement for summary...");

    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Function to create a regex that matches text even if split by XML tags
    const createSurgicalRegex = (text: string) => {
      return new RegExp(
        text.split('').map(c => escapeRegExp(c)).join('(<[^>]+>)*'),
        'g'
      );
    };

    // Replace Summary
    const summaryRegex = createSurgicalRegex(opt.originalSummary);
    if (xml.match(summaryRegex)) {
      console.log("Match found for summary! Replacing...");
      xml = xml.replace(summaryRegex, opt.newSummary);
    } else {
      console.warn("Could not find exact match for original summary in document XML. Skipping surgical replacement.");
    }

    // Replace Bullets
    if (opt.bulletReplacements) {
      let bulletMatches = 0;
      for (const replacement of opt.bulletReplacements) {
        if (replacement.original && replacement.new) {
          const bulletRegex = createSurgicalRegex(replacement.original);
          if (xml.match(bulletRegex)) {
            xml = xml.replace(bulletRegex, replacement.new);
            bulletMatches++;
          }
        }
      }
      console.log(`Replaced ${bulletMatches} bullet points out of ${opt.bulletReplacements.length} requested.`);
    }

    // 5. Re-zip and return
    zip.file("word/document.xml", xml);
    const outputBuffer = zip.generate({ type: "nodebuffer" });

    console.log("Optimization complete. Sending document...");

    return new Response(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="HUNTR_Optimized_${user.name?.replace(/\s+/g, '_')}_Resume.docx"`,
      },
    });

  } catch (error: any) {
    console.error("CRITICAL: Resume Optimization Error!");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    return NextResponse.json({ 
      error: "Optimization failed on the server.", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
