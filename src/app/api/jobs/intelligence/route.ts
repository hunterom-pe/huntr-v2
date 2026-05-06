import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { generateStrategicAudit } from "@/lib/gemini";
import mammoth from "mammoth";
import fs from "fs/promises";
import path from "path";

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

    // --- REJECTION ANALYSIS ---
    const rejectedJobs = trackedJobs.filter(j => j.status === 'REJECTED');
    const reasonsMap: Record<string, number> = {};
    const rejectionInsights: string[] = [];

    rejectedJobs.forEach(job => {
      if (job.rejectionReason) {
        job.rejectionReason.split(', ').forEach(reason => {
          reasonsMap[reason] = (reasonsMap[reason] || 0) + 1;
        });
      }
      if (job.rejectionNotes) {
        rejectionInsights.push(`[${job.company}] ${job.rejectionNotes}`);
      }
    });

    const frictionData = Object.entries(reasonsMap)
      .map(([name, count]) => ({ 
        name, 
        count, 
        percentage: Math.round((count / rejectedJobs.length) * 100) 
      }))
      .sort((a, b) => b.count - a.count);

    // --- AI STRATEGIC AUDIT ---
    let strategicInsight = "Your search is currently focused on high-match roles. Continue gathering signals to generate a deep-learning pivot recommendation.";
    
    if (rejectedJobs.length > 0 && user.resumePath) {
      try {
        let resumeText = "";
        const fileName = path.basename(user.resumePath);
        const filePath = path.join(process.cwd(), "storage/resumes", fileName);
        const resumeBuffer = await fs.readFile(filePath);
        const extracted = await mammoth.extractRawText({ buffer: resumeBuffer });
        resumeText = extracted.value;

        strategicInsight = await generateStrategicAudit(
          resumeText, 
          user.jobTitle || "Professional", 
          rejectionInsights
        );
      } catch (e) {
        console.error("Failed to extract resume for intel audit:", e);
      }
    }

    // Skill signals (Dynamic fallback based on job title)
    const baseSkills = user.jobTitle?.toLowerCase().includes('design') 
      ? [
          { name: "Figma Mastery", level: 95, trending: true },
          { name: "Design Systems", level: 88, trending: true },
          { name: "Prototyping", level: 82, trending: false },
          { name: "User Research", level: 75, trending: true }
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
      friction: frictionData,
      insight: strategicInsight
    });
  } catch (error) {
    console.error("Intelligence API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
