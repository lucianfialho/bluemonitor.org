import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

const VALID_EVENTS = ["down", "slow", "recovered"];

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sql = getDb();

  await sql`
    DELETE FROM webhooks
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const sql = getDb();

  if (body.url !== undefined) {
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    await sql`
      UPDATE webhooks SET url = ${body.url}
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;
  }

  if (body.events !== undefined) {
    if (
      !Array.isArray(body.events) ||
      body.events.length === 0 ||
      !body.events.every((e: string) => VALID_EVENTS.includes(e))
    ) {
      return NextResponse.json(
        { error: `Events must be a subset of: ${VALID_EVENTS.join(", ")}` },
        { status: 400 }
      );
    }
    await sql`
      UPDATE webhooks SET events = ${body.events}::text[]
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;
  }

  if (body.active !== undefined) {
    await sql`
      UPDATE webhooks SET active = ${body.active}
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;
  }

  return NextResponse.json({ success: true });
}
