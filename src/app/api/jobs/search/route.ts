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

    const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

    if (!SERPAPI_KEY) {
      console.warn("No SERPAPI_API_KEY found, falling back to mock data.");
      // Fallback mock data if key isn't set
      const fallbackJobs = [
        {
          id: Math.random().toString(36).substr(2, 9),
          title: `Senior ${title}`,
          company: "TechNova Inc.",
          location: location,
          description: `We are looking for a highly skilled ${title} to join our team. You will be responsible for creating massive impact.`,
          matchScore: 92,
          applyLink: "#"
        }
      ];
      return NextResponse.json({ jobs: fallbackJobs });
    }

    // Call SerpApi Google Jobs
    const query = encodeURIComponent(`${title} ${location}`);
    const serpUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${query}&api_key=${SERPAPI_KEY}`;
    
    const response = await fetch(serpUrl);
    const data = await response.json();

    if (!data.jobs_results) {
      throw new Error("No jobs returned from SerpApi");
    }

    // Map the real jobs to our UI structure
    const liveJobs = data.jobs_results.slice(0, 10).map((job: any) => {
      return {
        id: job.job_id || Math.random().toString(36).substr(2, 9),
        title: job.title || title,
        company: job.company_name || "Unknown Company",
        location: job.location || location,
        description: job.description ? job.description.substring(0, 300) + "..." : "No description provided.",
        matchScore: Math.floor(Math.random() * (98 - 85 + 1)) + 85, // We'll keep simulated match score until Phase 4 (AI Matching)
        applyLink: job.apply_options?.[0]?.link || "#"
      };
    });

    return NextResponse.json({ jobs: liveJobs });
  } catch (error) {
    console.error("Job Search Error:", error);
    return NextResponse.json({ error: "Failed to search live jobs" }, { status: 500 });
  }
}
