import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const plan = session.metadata?.plan;
    const userEmail = session.customer_email;

    if (userEmail && plan) {
      console.log(`[STRIPE] Upgrade detected: ${userEmail} -> ${plan}`);
      
      await prisma.user.update({
        where: { email: userEmail },
        data: { tier: plan },
      });
      
      console.log(`[STRIPE] User ${userEmail} successfully upgraded to ${plan}`);
    }
  }

  return NextResponse.json({ received: true });
}
