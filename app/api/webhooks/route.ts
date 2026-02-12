import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

const VALID_TYPES = ["discord", "slack", "custom"];
const VALID_EVENTS = ["down", "slow", "recovered"];
const FREE_EVENTS = ["down"];
const MAX_WEBHOOKS = 2;

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

  // TODO: check Pro plan when available — for now only "down" is free
  const proOnly = events.filter((e: string) => !FREE_EVENTS.includes(e));
  if (proOnly.length > 0) {
    return NextResponse.json(
      { error: `Events ${proOnly.join(", ")} require the Pro plan` },
      { status: 403 }
    );
  }

  const sql = getDb();

  const countResult = await sql`
    SELECT COUNT(*)::int as count FROM webhooks WHERE user_id = ${session.user.id}
  `;
  if (countResult[0].count >= MAX_WEBHOOKS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_WEBHOOKS} webhooks allowed` },
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
