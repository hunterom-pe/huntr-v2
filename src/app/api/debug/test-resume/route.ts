import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "storage/resumes/Sarah_Jenkins_Master.docx");
    const fileBuffer = await fs.readFile(filePath);
    
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Sarah_Jenkins_Master.docx"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Test resume not found" }, { status: 404 });
  }
}
