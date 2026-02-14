import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getUserPlan } from "@/lib/plans";

const VALID_TYPES = ["discord", "slack", "custom"];
const VALID_EVENTS = ["down", "slow", "recovered", "dead", "resurrected"];

export async function GET() {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const webhooks = await sql`
    SELECT id, url, type, events, active, created_at
    FROM webhooks
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
  `;

  return NextResponse.json({ webhooks });
}

export async function POST(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { url, type, events } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Type must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (
    !Array.isArray(events) ||
    events.length === 0 ||
    !events.every((e: string) => VALID_EVENTS.includes(e))
  ) {
    return NextResponse.json(
      { error: `Events must be a subset of: ${VALID_EVENTS.join(", ")}` },
      { status: 400 }
    );
  }

  const sql = getDb();
  const plan = await getUserPlan(session.user.id);

  const disallowed = events.filter(
    (e: string) => !plan.limits.allowedWebhookEvents.includes(e)
  );
  if (disallowed.length > 0) {
    return NextResponse.json(
      { error: `Events ${disallowed.join(", ")} require the Pro plan` },
      { status: 403 }
    );
  }

  const countResult = await sql`
    SELECT COUNT(*)::int as count FROM webhooks WHERE user_id = ${session.user.id}
  `;
  if (countResult[0].count >= plan.limits.maxWebhooks) {
    return NextResponse.json(
      { error: `Maximum ${plan.limits.maxWebhooks} webhooks allowed (${plan.tier} plan)` },
      { status: 400 }
    );
  }

  const result = await sql`
    INSERT INTO webhooks (user_id, url, type, events)
    VALUES (${session.user.id}, ${url}, ${type}, ${events}::text[])
    RETURNING id, url, type, events, active, created_at
  `;

  return NextResponse.json({ webhook: result[0] });
}
