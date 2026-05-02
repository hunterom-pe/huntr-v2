import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateNegotiationPlaybook } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, company, matchScore } = await req.json();

    if (!title || !company) {
      return NextResponse.json({ error: "Missing required job details" }, { status: 400 });
    }

    const playbook = await generateNegotiationPlaybook(title, company, matchScore || 90);

    if (!playbook) {
      return NextResponse.json({ error: "Failed to generate negotiation playbook" }, { status: 500 });
    }

    return NextResponse.json({ playbook });
  } catch (error) {
    console.error("Negotiation Playbook API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
