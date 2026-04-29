import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const title = user?.jobTitle || "Product Designer";
    const location = user?.location || "Remote";

    // In a real scenario, we would use SerpApi here:
    // const response = await fetch(`https://serpapi.com/search?engine=google_jobs&q=${title}+in+${location}&api_key=${process.env.SERPAPI_KEY}`);
    // const data = await response.json();
    
    // For now, let's provide high-fidelity simulated real-world data
    const simulatedJobs = [
      {
        id: Math.random().toString(36).substr(2, 9),
        title: title,
        company: "Airbnb",
        location: location,
        description: `We are looking for a ${title} to join our core design team. You will be responsible for creating intuitive user experiences that empower our hosts and guests. Requirements: 5+ years of experience, proficiency in Figma, and a strong portfolio.`,
        matchScore: 92,
        applyLink: "https://careers.airbnb.com"
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        title: title || "Senior UX Designer",
        company: "Uber",
        location: location || "San Francisco, CA",
        description: `Join the Uber Mobility team to help us redefine how the world moves. As a ${title}, you will lead design initiatives for our driver app, focusing on safety and efficiency.`,
        matchScore: 88,
        applyLink: "https://www.uber.com/careers"
      }
    ];

    return NextResponse.json({ jobs: simulatedJobs });
  } catch (error) {
    console.error("Job Search Error:", error);
    return NextResponse.json({ error: "Failed to search jobs" }, { status: 500 });
  }
}
