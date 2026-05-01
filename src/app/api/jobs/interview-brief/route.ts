import { NextResponse } from "next/server";
import { generateInterviewBrief } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { title, company, description } = await req.json();

    if (!title || !company || !description) {
      return NextResponse.json({ error: "Missing required job details" }, { status: 400 });
    }

    const brief = await generateInterviewBrief(title, company, description);

    if (!brief) {
      return NextResponse.json({ error: "Failed to generate interview brief" }, { status: 500 });
    }

    return NextResponse.json({ brief });
  } catch (error) {
    console.error("Interview Brief API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
