import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(toEmail: string, userName?: string | null) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not found. Skipping welcome email.");
    return;
  }

  const displayName = userName || toEmail.split('@')[0];

  try {
    const { data, error } = await resend.emails.send({
      from: 'Huntr <hello@precisionqaconsulting.com>',
      to: [toEmail],
      subject: 'Welcome to the Elite: Your Huntr Account is Ready',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f8fafc; border-radius: 24px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #0f172a; font-size: 32px; font-weight: 900; letter-spacing: 0.2em; margin: 0;">HUNTR</h1>
            <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 10px;">The Surgical Intelligence Engine</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-top: 0;">Welcome, ${displayName}.</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Your account has been successfully initialized. You now have access to the world's most advanced surgical job search engine. 
            </p>
            
            <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin-bottom: 24px;">
              <p style="color: #1e40af; font-size: 14px; font-weight: 700; margin: 0;">NEXT STEP:</p>
              <p style="color: #1e40af; font-size: 14px; margin: 5px 0 0 0;">Complete your profile to unlock surgical resume optimization and daily intelligence reports.</p>
            </div>
            
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Launch Your Dashboard</a>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #94a3b8; font-size: 12px;">
              © 2026 Huntr Systems &bull; Precision QA Consulting<br/>
              To stop receiving these emails, you can unsubscribe in your dashboard settings.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Email Sending Error:", error);
      return;
    }

    console.log("Welcome email sent successfully to:", toEmail, data?.id);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}
