/* DIAGNOSTIC: Force re-compile to resolve 404 ghost routes */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { optimizeResumeContent } from "@/lib/gemini";
import mammoth from "mammoth";
import PizZip from "pizzip";
import fs from "fs/promises";
import path from "path";
import { checkUsageLimit, incrementUsage } from "@/lib/usage";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // --- ACTION: OPTIMIZE ---
    if (body.action === 'optimize') {
      const usage = await checkUsageLimit(session.user.email, 'optimization');
      if (!usage.allowed) {
        return NextResponse.json({ error: "Limit Reached" }, { status: 403 });
      }

      if (!user.resumePath) {
        return NextResponse.json({ error: "No resume found" }, { status: 404 });
      }

      // 1. Fetch Resume
      let buffer: Buffer;
      if (user.resumePath.startsWith("http")) {
        const res = await fetch(user.resumePath);
        buffer = Buffer.from(await res.arrayBuffer());
      } else {
        const filePath = path.join(process.cwd(), "storage/resumes", path.basename(user.resumePath));
        buffer = await fs.readFile(filePath);
      }

      // 2. AI Optimization
      const extracted = await mammoth.extractRawText({ buffer });
      const opt = await optimizeResumeContent(extracted.value, body.jobDescription || "");
      
      if (!opt) return NextResponse.json({ error: "AI failed" }, { status: 422 });

      // 3. Surgical XML Update
      const zip = new PizZip(buffer);
      const xml = zip.file("word/document.xml")?.asText();
      if (!xml) throw new Error("XML Read Error");

      const paragraphs = xml.split(/(?=<w:p)/);
      const getCleanText = (p: string) => p.replace(/<[^>]+>/g, "").trim();
      const xmlEscape = (s: string) => s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m] || m));

      const updated = paragraphs.map(p => {
        const clean = getCleanText(p);
        if (clean.includes(opt.originalSummary?.substring(0, 30) || "____")) {
          const pPr = p.match(/<w:pPr>.*?<\/w:pPr>/)?.[0] || '';
          return `<w:p>${pPr}<w:r><w:t>${xmlEscape(opt.newSummary || "")}</w:t></w:r>`;
        }
        return p;
      });

      zip.file("word/document.xml", updated.join(""));
      const out = zip.generate({ type: "nodebuffer" });

      await incrementUsage(session.user.email, 'optimization');
      return new Response(new Uint8Array(out), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="Optimized_Resume.docx"`
        }
      });
    }

    // --- ACTION: SEARCH ---
    const usage = await checkUsageLimit(session.user.email, 'scan');
    if (!usage.allowed) return NextResponse.json({ error: "Limit Reached" }, { status: 403 });

    // Clear old wishlist jobs from DB so stale results don't reappear on refresh
    if (!body.page || body.page === 0) {
      await prisma.job.deleteMany({
        where: { userId: user.id, status: "WISHLIST" }
      });
    }

    const title = user.jobTitle?.trim() || "Product Designer";
    const loc = user.location?.trim() || "Remote";
    const key = process.env.SERPAPI_API_KEY;

    if (!key) return NextResponse.json({ jobs: [] });

    const isRemote = loc.toLowerCase().includes("remote") || loc.toLowerCase().includes("usa");
    const q = isRemote ? `${title} Remote` : title;

    // Normalize location to SerpApi canonical name (e.g. "Brooklyn, NY" -> "Brooklyn,New York,United States")
    let serpLocation = "";
    if (!isRemote) {
      try {
        const locRes = await fetch(`https://serpapi.com/locations.json?q=${encodeURIComponent(loc)}&limit=1`);
        const locData = await locRes.json();
        if (locData.length > 0) {
          serpLocation = locData[0].canonical_name || locData[0].name || loc;
          console.log(`[DEBUG] Location Normalized: "${loc}" -> "${serpLocation}"`);
        } else {
          serpLocation = loc;
          console.log(`[DEBUG] Location not found in SerpApi, using raw: "${loc}"`);
        }
      } catch {
        serpLocation = loc;
      }
    }

    const fetchJobs = async (start: number) => {
      try {
        const p = new URLSearchParams({
          engine: "google_jobs",
          q,
          gl: "us",
          hl: "en",
          start: start.toString(),
          api_key: key
        });
        if (serpLocation) p.append("location", serpLocation);
        
        // Only force remote if the location is actually Remote/USA or the user requested it
        if (isRemote || body.remoteOnly) {
          p.append("ltype", "1");
        }
        
        const res = await fetch(`https://serpapi.com/search.json?${p.toString()}`);
        const data = await res.json();
        console.log(`[DEBUG] SerpApi Response (Start: ${start}):`, {
          has_results: !!data.jobs_results,
          count: data.jobs_results?.length || 0,
          error: data.error || "none"
        });
        return data.jobs_results || [];
      } catch {
        return [];
      }
    };

    const results = await Promise.all([fetchJobs(0), fetchJobs(10), fetchJobs(20)]);
    let allJobs = results.flat();
    
    // When searching a specific city, filter out purely remote/anywhere listings
    if (!isRemote && allJobs.length > 0) {
      const filtered = allJobs.filter((j: any) => {
        const jLoc = (j.location || "").toLowerCase();
        return jLoc !== "anywhere" && jLoc !== "remote" && !jLoc.startsWith("anywhere");
      });
      // Only use filtered if it didn't wipe everything out
      if (filtered.length > 0) allJobs = filtered;
    }
    
    if (allJobs.length === 0) return NextResponse.json({ jobs: [] });

    const saved = await Promise.all(allJobs.slice(0, 30).map(async (j: any) => {
      const id = j.job_id || Math.random().toString(36).substr(2, 9);
      
      // UI Polish: Title and Location
      let displayTitle = j.title || "Unknown Position";
      let displayLocation = j.location || "Remote";

      // 1. Strip "job at ...", "role at ...", etc.
      displayTitle = displayTitle.split(/\s+(job|role)\s+at\s+/i)[0];
      displayTitle = displayTitle.split(/\s+at\s+[A-Z][a-z]+/)[0]; // Split at " at CompanyName"
      
      // 2. Strip long location lists (e.g. "in New York, NY, ...")
      displayTitle = displayTitle.split(/\s+in\s+[A-Z][a-z]+/)[0];

      const isActuallyRemote = 
        displayLocation.toLowerCase().includes("anywhere") || 
        displayLocation.toLowerCase().includes("remote") ||
        displayTitle.toLowerCase().includes("remote");

      if (isActuallyRemote) {
        displayLocation = "Remote";
        // Clean "remote" out of the title before re-adding it standardized
        displayTitle = displayTitle.replace(/\s*remote\s*/gi, " ").replace(/\s+/g, " ").trim();
        if (!displayTitle.includes("[Remote]")) {
          displayTitle = displayTitle + " [Remote]";
        }
      }

      // 3. Hard limit for visual consistency
      if (displayTitle.length > 70) {
        displayTitle = displayTitle.substring(0, 67) + "...";
      }

      // UI Polish: Description (Surgical cleanup)
      let displayDesc = j.description || "No description provided.";
      
      // 1. Remove Title if it's at the start
      const cleanTitleForMatch = displayTitle.replace(/\[Remote\]/g, "").trim().toLowerCase();
      if (displayDesc.toLowerCase().startsWith(cleanTitleForMatch)) {
        displayDesc = displayDesc.substring(cleanTitleForMatch.length).trim();
      }

      // 2. Remove common location/type prefixes
      displayDesc = displayDesc.replace(/^(remote|anywhere|work from home|full[- ]time|contract|internship)\s*[:-]?\s*/gi, "").trim();
      
      // 3. Final polish
      displayDesc = displayDesc.replace(/^[•\-–\s\r\n*]+/, ""); // Remove leading bullets
      displayDesc = displayDesc.charAt(0).toUpperCase() + displayDesc.slice(1); // Capitalize
      displayDesc = displayDesc.substring(0, 450) + "...";

      return prisma.job.upsert({
        where: { id },
        update: { 
          title: displayTitle,
          company: j.company_name || "Unknown",
          location: displayLocation,
          description: displayDesc
        },
        create: {
          id,
          title: displayTitle,
          company: j.company_name || "Unknown",
          location: displayLocation,
          description: displayDesc,
          matchScore: Math.floor(Math.random() * (98 - 85 + 1)) + 85,
          applyLink: j.apply_options?.[0]?.link || "#",
          status: "WISHLIST",
          userId: user.id
        }
      });
    }));

    await incrementUsage(session.user.email, 'scan');
    return NextResponse.json({ jobs: saved });

  } catch (err: any) {
    console.error("SEARCH_ROUTE_CRITICAL:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
