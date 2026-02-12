import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = body.email?.trim()?.toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const sql = getDb();

  await sql`
    INSERT INTO pro_waitlist (email)
    VALUES (${email})
    ON CONFLICT (email) DO NOTHING
  `;

  return NextResponse.json({ success: true });
}
