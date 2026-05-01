import { NextResponse } from "next/server";
import { generateFollowUpEmail } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { title, company } = await req.json();

    if (!title || !company) {
      return NextResponse.json({ error: "Missing job title or company name" }, { status: 400 });
    }

    const email = await generateFollowUpEmail(title, company);

    return NextResponse.json({ email });
  } catch (error) {
    console.error("Follow-up API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
