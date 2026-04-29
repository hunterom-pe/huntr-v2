import { NextResponse } from "next/server";
import { optimizeResumeContent } from "@/lib/gemini";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const jobDescription = formData.get("jobDescription") as string;

    if (!file || !jobDescription) {
      return NextResponse.json({ error: "Missing file or job description" }, { status: 400 });
    }

    // 1. Extract text from original DOCX
    const arrayBuffer = await file.arrayBuffer();
    const { value: resumeText } = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });

    // 2. Get AI Optimization
    const optimization = await optimizeResumeContent(resumeText, jobDescription);
    if (!optimization) {
      throw new Error("AI Optimization failed");
    }

    // 3. Reconstruct DOCX (High-Fidelity Template Approach)
    // NOTE: For true "surgical" cloning, we'd need to use docxtemplater with a tagged template.
    // Here we create a clean, professional version as a proof of concept.
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "OPTIMIZED RESUME",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Professional Summary",
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            text: optimization.summary,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Key Accomplishments (Optimized)",
                bold: true,
                size: 28,
              }),
            ],
          }),
          ...optimization.bulletPoints.map((bullet: string) => 
            new Paragraph({
              text: bullet,
              bullet: { level: 0 },
            })
          ),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="HUNTR_Optimized_Resume.docx"`,
      },
    });

  } catch (error) {
    console.error("Resume Optimization Error:", error);
    return NextResponse.json({ error: "Failed to optimize resume" }, { status: 500 });
  }
}
