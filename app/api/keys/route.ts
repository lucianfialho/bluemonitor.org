import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";

export async function GET() {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const keys = await sql`
    SELECT id, name, substring(key from 1 for 10) || '...' as key_preview, created_at, last_used_at
    FROM api_keys
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
  `;

  return NextResponse.json({ keys });
}

export async function POST(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = body.name?.trim() || "Default";

  if (name.length > 100) {
    return NextResponse.json({ error: "Name too long" }, { status: 400 });
  }

  const key = "bm_" + randomBytes(24).toString("hex");
  const sql = getDb();

  await sql`
    INSERT INTO api_keys (user_id, key, name)
    VALUES (${session.user.id}, ${key}, ${name})
  `;

  return NextResponse.json({ key, name });
}

export async function DELETE(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing key id" }, { status: 400 });
  }

  const sql = getDb();
  await sql`
    DELETE FROM api_keys
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;

  return NextResponse.json({ success: true });
}
