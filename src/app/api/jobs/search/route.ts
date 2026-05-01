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
    const startOffset = page * 10;

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

    // Call SerpApi Google Jobs
    const query = encodeURIComponent(title);
    const searchLocation = location.toLowerCase() === "remote" ? "United States" : encodeURIComponent(location);
    const remoteParam = location.toLowerCase() === "remote" ? "&ltype=1" : "";
    
    const serpUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${query}&location=${searchLocation}&gl=us&hl=en&start=${startOffset}&api_key=${SERPAPI_KEY}${remoteParam}`;
    
    console.log("Searching for jobs with URL:", serpUrl);
    
    let response = await fetch(serpUrl);
    let data = await response.json();

    console.log("SerpApi raw results count:", data.jobs_results?.length || 0);

    // If no results found, try searching for just the title in q
    if (!data.jobs_results) {
      console.warn(`No results for "${title}" in "${location}". Trying broad search...`);
      const broadUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(title + " " + location)}&gl=us&hl=en&start=${startOffset}&api_key=${SERPAPI_KEY}`;
      response = await fetch(broadUrl);
      data = await response.json();
    }

    if (!data.jobs_results) {
      return NextResponse.json({ jobs: [] });
    }

    // Map and Persist the live jobs
    const savedJobs = [];
    if (user) {
      for (const job of data.jobs_results.slice(0, 10)) {
        const jobId = job.job_id || Math.random().toString(36).substr(2, 9);
        const mappedJob = {
          id: jobId,
          title: job.title || title,
          company: job.company_name || "Unknown Company",
          location: job.location || location,
          description: job.description ? job.description.substring(0, 500) + "..." : "No description provided.",
          matchScore: Math.floor(Math.random() * (98 - 85 + 1)) + 85,
          applyLink: job.apply_options?.[0]?.link || "#",
          status: "WISHLIST",
          userId: user.id
        };

        const persistedJob = await prisma.job.upsert({
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
        savedJobs.push(persistedJob);
      }
    }

    return NextResponse.json({ jobs: savedJobs });
  } catch (error) {
    console.error("Job Search Error:", error);
    return NextResponse.json({ error: "Failed to search live jobs" }, { status: 500 });
  }
}
