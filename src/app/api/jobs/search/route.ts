/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
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

    const body = await req.json().catch(() => ({}));
    const page = parseInt(body.page) || 0;
    const startOffset = page * 30;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const title = user?.jobTitle || "Product Designer";
    const location = user?.location || "Remote";

    const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

    if (!SERPAPI_KEY) {
      console.warn("No SERPAPI_API_KEY found, falling back to mock data.");
      const fallbackJobs = [
        {
          id: "mock-" + Math.random().toString(36).substr(2, 9),
          title: `Senior ${title}`,
          company: "TechNova Inc.",
          location: location,
          description: `We are looking for a highly skilled ${title} to join our team. You will be responsible for creating massive impact.`,
          matchScore: 92,
          applyLink: "#",
          status: "WISHLIST",
          userId: user?.id
        }
      ];
      return NextResponse.json({ jobs: fallbackJobs });
    }

    // Call SerpApi Google Jobs - Fetch 5 pages (10 each) to get 50 results
    const query = encodeURIComponent(title);
    const searchLocation = location.toLowerCase() === "remote" ? "United States" : encodeURIComponent(location);
    const remoteParam = location.toLowerCase() === "remote" ? "&ltype=1" : "";
    
    const fetchJobs = async (start: number) => {
      const url = `https://serpapi.com/search.json?engine=google_jobs&q=${query}&location=${searchLocation}&gl=us&hl=en&start=${start}&api_key=${SERPAPI_KEY}${remoteParam}`;
      console.log(`Fetching SerpApi page starting at ${start}`);
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
    console.log("Total SerpApi results count:", allJobsResults.length);

    if (allJobsResults.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    // Map and Persist the live jobs in parallel
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
  } catch (error) {
    console.error("Job Search Error:", error);
    return NextResponse.json({ error: "Failed to search live jobs" }, { status: 500 });
  }
}
