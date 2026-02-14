import { NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";

export async function POST() {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT stripe_customer_id FROM user_plans
    WHERE user_id = ${session.user.id} AND stripe_customer_id IS NOT NULL
    LIMIT 1
  `;

  if (rows.length === 0 || !rows[0].stripe_customer_id) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 404 }
    );
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.bluemonitor.org";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: rows[0].stripe_customer_id as string,
    return_url: `${appUrl}/dashboard`,
  });

  return NextResponse.json({ url: portalSession.url });
}
