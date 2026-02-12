import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  let email: string | undefined;

  // Try to get email from session first
  const { data: session } = await authServer.getSession();
  if (session?.user?.email) {
    email = session.user.email.trim().toLowerCase();
  } else {
    // Fall back to body for non-logged-in users
    const body = await request.json();
    email = body.email?.trim()?.toLowerCase();
  }

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
