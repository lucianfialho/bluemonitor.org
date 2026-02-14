import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getUserPlan } from "@/lib/plans";

export async function GET() {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const services = await sql`
    SELECT s.id, s.slug, s.name, s.domain, s.category, s.current_status,
           s.current_response_time, s.last_checked_at, s.last_heartbeat_at, s.is_private, w.added_at,
           (SELECT ROUND(
              COUNT(*) FILTER (WHERE sc.status = 'up') * 100.0 / NULLIF(COUNT(*), 0), 1
            )
            FROM status_checks sc
            WHERE sc.service_id = s.id
              AND sc.checked_at > NOW() - INTERVAL '24 hours'
           ) AS uptime_24h
    FROM watchlist w
    JOIN services s ON s.id = w.service_id
    WHERE w.user_id = ${session.user.id}
    ORDER BY w.added_at DESC
  `;

  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const serviceId = body.serviceId;

  if (!serviceId || typeof serviceId !== "number") {
    return NextResponse.json({ error: "Invalid serviceId" }, { status: 400 });
  }

  const sql = getDb();

  const plan = await getUserPlan(session.user.id);

  const countResult = await sql`
    SELECT COUNT(*)::int as count FROM watchlist WHERE user_id = ${session.user.id}
  `;
  if (plan.limits.maxWatchlist !== Infinity && countResult[0].count >= plan.limits.maxWatchlist) {
    return NextResponse.json(
      { error: `Maximum ${plan.limits.maxWatchlist} services in watchlist (${plan.tier} plan)` },
      { status: 400 }
    );
  }

  await sql`
    INSERT INTO watchlist (user_id, service_id)
    VALUES (${session.user.id}, ${serviceId})
    ON CONFLICT (user_id, service_id) DO NOTHING
  `;

  return NextResponse.json({ success: true });
}
