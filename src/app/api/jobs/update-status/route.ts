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
    const { id, title, company, location, description, matchScore, status, isDeleted } = body;

    if (!id) {
      // If no ID is provided, we must have title/company to create a new one
      if (!title || !company) {
        return NextResponse.json({ error: "Missing required job data" }, { status: 400 });
      }
    }

    let savedJob;

    if (id) {
      // Try to find existing
      const existingJob = await prisma.job.findUnique({
        where: { id }
      });

      if (existingJob) {
        // Update existing fields if provided
        savedJob = await prisma.job.update({
          where: { id },
          data: { 
            status: status || undefined,
            isDeleted: isDeleted !== undefined ? isDeleted : undefined,
            title: title || undefined,
            company: company || undefined
          }
        });
      } else if (title && company) {
        // Create new with provided ID
        savedJob = await prisma.job.create({
          data: {
            id,
            title,
            company,
            location: location || "",
            description: description || "",
            matchScore: parseInt(matchScore) || 0,
            status: status || "WISHLIST",
            userId: user.id
          }
        });
      }
    } else {
      // Create new with generated ID
      savedJob = await prisma.job.create({
        data: {
          title,
          company,
          location: location || "",
          description: description || "",
          matchScore: parseInt(matchScore) || 0,
          status: status || "WISHLIST",
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
