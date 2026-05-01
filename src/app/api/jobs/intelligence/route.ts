import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { jobs: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trackedJobs = user.jobs.filter(j => !j.isDeleted);
    const appliedThisWeek = trackedJobs.filter(j => j.status !== 'WISHLIST' && j.createdAt >= sevenDaysAgo).length;
    const previousWeek = trackedJobs.filter(j => j.status !== 'WISHLIST' && j.createdAt < sevenDaysAgo && j.createdAt >= new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000)).length;
    
    const velocityDiff = previousWeek === 0 ? appliedThisWeek * 100 : Math.round(((appliedThisWeek - previousWeek) / previousWeek) * 100);
    
    const avgMatch = trackedJobs.length > 0 
      ? Math.round(trackedJobs.reduce((acc, curr) => acc + curr.matchScore, 0) / trackedJobs.length)
      : 0;

    // Simple skill extraction (mocked for now, but based on user job title)
    const baseSkills = user.jobTitle?.toLowerCase().includes('qa') 
      ? [
          { name: "Automation Testing", level: 92, trending: true },
          { name: "Selenium / Cypress", level: 88, trending: true },
          { name: "API Testing", level: 85, trending: false },
          { name: "Performance Testing", level: 78, trending: true }
        ]
      : [
          { name: "React / Next.js", level: 95, trending: true },
          { name: "TypeScript", level: 90, trending: true },
          { name: "System Design", level: 82, trending: false },
          { name: "Cloud Architecture", level: 75, trending: true }
        ];

    return NextResponse.json({
      stats: [
        { label: "Weekly Velocity", value: appliedThisWeek.toString(), sub: `${velocityDiff >= 0 ? '+' : ''}${velocityDiff}% from last week`, color: "blue" },
        { label: "Avg DNA Match", value: `${avgMatch}%`, sub: avgMatch > 90 ? "Top 5% of candidates" : "Highly competitive", color: "emerald" },
        { label: "Profile Strength", value: avgMatch > 85 ? "Elite" : "Strong", sub: "Based on match scores", color: "indigo" }
      ],
      skills: baseSkills,
      insight: `You have a ${avgMatch}% match rate in ${user.jobTitle || 'your field'}. We recommend targeting 3 more applications this week to maintain your momentum.`
    });
  } catch (error) {
    console.error("Intelligence API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
