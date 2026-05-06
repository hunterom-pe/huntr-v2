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

    const { plan } = await req.json();

    if (!plan || (plan !== 'ELITE' && plan !== 'PROFESSIONAL')) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Mapping plans to prices (You will replace these with real Price IDs from Stripe Dashboard)
    const priceMap: Record<string, number> = {
      'ELITE': 1500, // $15.00
      'PROFESSIONAL': 2900, // $29.00
    };

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Huntr ${plan} Membership`,
              description: plan === 'ELITE' ? 'Unlimited optimizations & tactical briefs' : 'Full career management suite',
            },
            unit_amount: priceMap[plan],
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?checkout=cancelled`,
      customer_email: session.user.email,
      metadata: {
        userId: (session.user as any).id,
        plan: plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
