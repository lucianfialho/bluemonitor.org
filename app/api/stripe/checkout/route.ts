import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const period = body.period === "annual" ? "annual" : "monthly";

  const priceId =
    period === "annual"
      ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID
      : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const sql = getDb();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.bluemonitor.org";

  // Reuse existing Stripe customer if we have one
  const existing = await sql`
    SELECT stripe_customer_id FROM user_plans
    WHERE user_id = ${session.user.id} AND stripe_customer_id IS NOT NULL
    LIMIT 1
  `;
  const customerId = existing[0]?.stripe_customer_id as string | undefined;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    ...(customerId
      ? { customer: customerId }
      : { customer_email: session.user.email }),
    metadata: { userId: session.user.id },
    subscription_data: {
      metadata: { userId: session.user.id },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
