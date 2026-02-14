import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { authServer } from "@/lib/auth/server";
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

  // Find user via Neon Auth admin API
  const { data: usersData } = await authServer.admin.listUsers({
    query: {
      searchValue: email,
      searchField: "email",
      searchOperator: "contains",
      limit: 1,
    },
  });

  if (!usersData?.users?.length) {
    return NextResponse.json(
      { error: `No user found with email: ${email}` },
      { status: 404 }
    );
  }

  const user = usersData.users[0];
  const sql = getDb();

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

// GET: List all users with their plan info
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch users from Neon Auth admin API
  const { data: usersData } = await authServer.admin.listUsers({
    query: {
      limit: 100,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  });

  if (!usersData?.users?.length) {
    return NextResponse.json({ users: [] });
  }

  // Fetch plan info from our DB
  const sql = getDb();
  const userIds = usersData.users.map((u: { id: string }) => u.id);
  const plans = await sql`
    SELECT user_id, plan, status, billing_period, current_period_end, created_at
    FROM user_plans
    WHERE user_id = ANY(${userIds})
  `;

  const planMap = new Map(plans.map((p: Record<string, unknown>) => [p.user_id, p]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = usersData.users.map((u: any) => {
    const plan = planMap.get(u.id) as Record<string, unknown> | undefined;
    return {
      user_id: u.id,
      email: u.email,
      name: u.name,
      plan: plan?.plan ?? "free",
      status: plan?.status ?? "active",
      billing_period: plan?.billing_period ?? null,
      current_period_end: plan?.current_period_end ?? null,
      created_at: u.createdAt,
    };
  });

  return NextResponse.json({ users });
}
