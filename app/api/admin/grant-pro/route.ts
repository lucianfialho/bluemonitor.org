import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

// POST: Grant Pro to a user by email
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, action } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const sql = getDb();

  // Find user by email in the auth system
  const users = await sql`
    SELECT id, email, name FROM "user" WHERE email = ${email} LIMIT 1
  `;

  if (users.length === 0) {
    return NextResponse.json(
      { error: `No user found with email: ${email}` },
      { status: 404 }
    );
  }

  const user = users[0];

  if (action === "revoke") {
    await sql`
      UPDATE user_plans
      SET plan = 'free', status = 'canceled', updated_at = NOW()
      WHERE user_id = ${user.id}
    `;
    return NextResponse.json({
      ok: true,
      action: "revoked",
      user: { id: user.id, email: user.email, name: user.name },
    });
  }

  // Default: grant Pro (beta)
  await sql`
    INSERT INTO user_plans (user_id, plan, status, billing_period, updated_at)
    VALUES (${user.id}, 'pro', 'active', 'beta', NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      plan = 'pro',
      status = 'active',
      billing_period = 'beta',
      updated_at = NOW()
  `;

  return NextResponse.json({
    ok: true,
    action: "granted",
    user: { id: user.id, email: user.email, name: user.name },
  });
}

// GET: List all Pro users
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT up.user_id, u.email, u.name, up.plan, up.status, up.billing_period,
           up.current_period_end, up.created_at
    FROM user_plans up
    JOIN "user" u ON u.id = up.user_id
    ORDER BY up.created_at DESC
  `;

  return NextResponse.json({ users: rows });
}
