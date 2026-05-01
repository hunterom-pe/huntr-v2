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
    let resumeBuffer: Buffer;
    if (user.resumePath.startsWith("http")) {
      const res = await fetch(user.resumePath);
      const arrayBuffer = await res.arrayBuffer();
      resumeBuffer = Buffer.from(arrayBuffer);
    } else {
      // SECURITY: Read from protected storage instead of public web root
      const fileName = path.basename(user.resumePath);
      const filePath = path.join(process.cwd(), "storage/resumes", fileName);
      resumeBuffer = await fs.readFile(filePath);
    }

    // 2. Extract raw text for AI
    const extracted = await mammoth.extractRawText({ buffer: resumeBuffer });
    const resumeText = extracted.value;

    // 3. Get AI Optimization (Mapping original to new)
    const opt = await optimizeResumeContent(resumeText, jobDescription);
    console.log("AI Optimization Result:", opt ? "Success" : "Failed");
    
    if (!opt || !opt.originalSummary) {
      console.error("AI failed to find original summary in resume text.");
      throw new Error("AI Optimization failed to map original content");
    }

    // 4. Surgical XML Replacement (The "Secret Sauce")
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
    xml = xml.replace(summaryRegex, opt.newSummary);

    // Replace Bullets
    if (opt.bulletReplacements) {
      for (const replacement of opt.bulletReplacements) {
        if (replacement.original && replacement.new) {
          const bulletRegex = createSurgicalRegex(replacement.original);
          xml = xml.replace(bulletRegex, replacement.new);
        }
      }
    }

    // 5. Re-zip and return
    zip.file("word/document.xml", xml);
    const outputBuffer = zip.generate({ type: "nodebuffer" });

    return new Response(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="HUNTR_Optimized_${user.name?.replace(/\s+/g, '_')}_Resume.docx"`,
      },
    });

  } catch (error) {
    console.error("Resume Optimization Error:", error);
    return NextResponse.json({ error: "Failed to optimize resume" }, { status: 500 });
  }
}
