import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import Stripe from "stripe";

// Helper to get current_period_end from subscription items (Stripe v20+)
function getPeriodEnd(sub: Stripe.Subscription): string | null {
  const itemEnd = sub.items?.data?.[0]?.current_period_end;
  if (itemEnd) return new Date(itemEnd * 1000).toISOString();
  return null;
}

function getBillingPeriod(sub: Stripe.Subscription): string {
  return sub.items?.data?.[0]?.price?.recurring?.interval === "year"
    ? "annual"
    : "monthly";
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  const sql = getDb();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId || !session.subscription || !session.customer) break;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer.id;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const billingPeriod = getBillingPeriod(sub);
      const periodEnd = getPeriodEnd(sub) ?? new Date().toISOString();

      await sql`
        INSERT INTO user_plans (user_id, stripe_customer_id, stripe_subscription_id, plan, status, billing_period, current_period_end, updated_at)
        VALUES (${userId}, ${customerId}, ${subscriptionId}, 'pro', 'active', ${billingPeriod}, ${periodEnd}, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          plan = 'pro',
          status = 'active',
          billing_period = EXCLUDED.billing_period,
          current_period_end = EXCLUDED.current_period_end,
          updated_at = NOW()
      `;
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      // In Stripe v20, subscription info is on parent.subscription_details
      const subRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subRef === "string"
        ? subRef
        : subRef?.id;
      if (!subscriptionId) break;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const periodEnd = getPeriodEnd(sub) ?? new Date().toISOString();

      await sql`
        UPDATE user_plans
        SET status = 'active',
            current_period_end = ${periodEnd},
            updated_at = NOW()
        WHERE stripe_subscription_id = ${subscriptionId}
      `;
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const status = sub.cancel_at_period_end ? "canceling" : "active";
      const billingPeriod = getBillingPeriod(sub);
      const periodEnd = getPeriodEnd(sub) ?? new Date().toISOString();

      await sql`
        UPDATE user_plans
        SET status = ${status},
            billing_period = ${billingPeriod},
            current_period_end = ${periodEnd},
            updated_at = NOW()
        WHERE stripe_subscription_id = ${sub.id}
      `;
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;

      await sql`
        UPDATE user_plans
        SET plan = 'free',
            status = 'canceled',
            updated_at = NOW()
        WHERE stripe_subscription_id = ${sub.id}
      `;
      break;
    }
  }

  return NextResponse.json({ received: true });
}
