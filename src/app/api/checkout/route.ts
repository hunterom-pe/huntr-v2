import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      console.error("Stripe Secret Key is missing or invalid.");
      return NextResponse.json({ error: "Payments are currently disabled. Please contact support." }, { status: 503 });
    }

    const { plan } = await req.json();

    if (!plan || (plan !== 'ELITE' && plan !== 'PROFESSIONAL')) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Mapping plans to actual Price IDs from Stripe Dashboard
    const priceMap: Record<string, string> = {
      'ELITE': 'price_1TUA0pLkFDyP0eAeJzpBV0ob',
      'PROFESSIONAL': 'price_1TUA1GLkFDyP0eAeyylI7i6f',
    };

    // Determine the base URL for redirects. 
    // We prioritize NEXTAUTH_URL, then the request's own origin.
    const url = new URL(req.url);
    const origin = req.headers.get('origin') || `${url.protocol}//${req.headers.get('host')}`;
    const baseUrl = process.env.NEXTAUTH_URL || origin;
    
    if (!baseUrl || !baseUrl.startsWith('http')) {
      return NextResponse.json({ 
        error: "Configuration error", 
        details: `Invalid Base URL: ${baseUrl}. Please ensure NEXTAUTH_URL is set with https://` 
      }, { status: 500 });
    }

    console.log(`[STRIPE] Creating checkout session for ${session.user.email} (Plan: ${plan}, BaseURL: ${baseUrl})`);

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceMap[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      customer_email: session.user.email,
      metadata: {
        userId: (session.user as any).id || 'unknown',
        plan: plan,
      },
    });

    console.log(`[STRIPE] Session created: ${checkoutSession.id}`);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    // Include the baseUrl in the error details to debug the "Invalid URL" error
    const baseUrl = process.env.NEXTAUTH_URL || req.headers.get('origin') || 'unknown';
    return NextResponse.json({ 
      error: "Could not initiate checkout", 
      details: `${error.message} (Detected BaseURL: ${baseUrl})` 
    }, { status: 500 });
  }
}
