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
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { id, title, company, location, description, matchScore, status } = body;

    if (!title || !company) {
      return NextResponse.json({ error: "Missing job data" }, { status: 400 });
    }

    // Check if job already exists in DB for this user
    let existingJob = null;
    
    // Some generated jobs have short random IDs, DB uses cuid. 
    // We check if it exists by ID. If not, we create it.
    if (id) {
      existingJob = await prisma.job.findUnique({
        where: { id }
      });
    }

    let savedJob;

    if (existingJob) {
      // Update existing
      savedJob = await prisma.job.update({
        where: { id },
        data: { status }
      });
    } else {
      // Create new
      savedJob = await prisma.job.create({
        data: {
          id: id || undefined, // Use provided ID if possible, else let Prisma generate cuid
          title,
          company,
          location,
          description,
          matchScore: parseInt(matchScore) || 0,
          status,
          userId: user.id
        }
      });
    }

    return NextResponse.json({ success: true, job: savedJob });
  } catch (error) {
    console.error("Update Job Status Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
