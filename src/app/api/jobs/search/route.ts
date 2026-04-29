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

    // Clean the title to find the "base" role (removing Senior, Junior, etc.)
    const cleanTitle = title.replace(/^(Senior|Sr\.?|Junior|Jr\.?|Lead|Principal|Staff|Chief|Head of)\s+/i, '').trim();
    
    // Generate some realistic variations based on common industry synonyms
    const generateVariants = (base: string) => {
      const lowerBase = base.toLowerCase();
      if (lowerBase.includes('qa') || lowerBase.includes('quality') || lowerBase.includes('test')) {
        return ['QA Engineer', 'Quality Assurance Analyst', 'Software Tester', 'SDET', 'QA Automation Engineer'];
      }
      if (lowerBase.includes('design') || lowerBase.includes('ui') || lowerBase.includes('ux')) {
        return ['UX/UI Designer', 'Product Designer', 'Experience Designer', 'Interaction Designer'];
      }
      if (lowerBase.includes('develop') || lowerBase.includes('engineer') || lowerBase.includes('program')) {
        return ['Software Engineer', 'Full Stack Developer', 'Backend Engineer', 'Frontend Developer'];
      }
      if (lowerBase.includes('product') || lowerBase.includes('manager')) {
        return ['Product Manager', 'Technical Product Manager', 'Product Owner', 'Group Product Manager'];
      }
      // Fallback: just add some generic modifiers to their exact base
      return [base, `Senior ${base}`, `${base} II`, `Lead ${base}`];
    };

    const variants = [title, cleanTitle, ...generateVariants(cleanTitle)];
    const uniqueVariants = Array.from(new Set(variants.filter(v => v))).slice(0, 4); // Take up to 4 unique variants

    const companies = ["Airbnb", "Uber", "Stripe", "Spotify", "Netflix", "Google", "Apple", "Notion"];
    
    // Generate high-fidelity simulated jobs using the variants
    const simulatedJobs = uniqueVariants.map((variantTitle) => {
      const company = companies[Math.floor(Math.random() * companies.length)];
      return {
        id: Math.random().toString(36).substr(2, 9),
        title: variantTitle,
        company: company,
        location: location,
        description: `We are looking for a highly skilled ${variantTitle} to join our ${company} team. You will be responsible for creating massive impact and working cross-functionally. Requirements: 3+ years of experience, strong communication, and a proven track record.`,
        matchScore: Math.floor(Math.random() * (98 - 85 + 1)) + 85, // Random score between 85-98
        applyLink: `https://careers.${company.toLowerCase()}.com`
      };
    });

    return NextResponse.json({ jobs: simulatedJobs });
  } catch (error) {
    console.error("Job Search Error:", error);
    return NextResponse.json({ error: "Failed to search jobs" }, { status: 500 });
  }
}
