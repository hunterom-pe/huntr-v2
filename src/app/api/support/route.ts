import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const supportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = supportSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    // Send email to the support inbox (Testing directly to personal email)
    const { error } = await resend.emails.send({
      from: "CareerHuntr Support <hello@careerhuntr.io>",
      to: ["hunterom8@proton.me"],
      replyTo: email,
      subject: `[SUPPORT TICKET] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #0f172a;">New Support Inquiry</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="white-space: pre-wrap; line-height: 1.6; color: #334155;">${message}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">Sent via CareerHuntr Support Center</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ message: "Message sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Support API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
