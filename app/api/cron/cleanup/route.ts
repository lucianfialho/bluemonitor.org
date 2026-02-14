import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  // Count before deleting
  const [checksCount] = await sql`
    SELECT COUNT(*)::int AS count FROM status_checks
    WHERE checked_at < NOW() - INTERVAL '30 days'
  `;
  const [incidentsCount] = await sql`
    SELECT COUNT(*)::int AS count FROM incidents
    WHERE status = 'resolved'
      AND resolved_at < NOW() - INTERVAL '90 days'
  `;
  const [submissionsCount] = await sql`
    SELECT COUNT(*)::int AS count FROM submissions
    WHERE status = 'rejected'
      AND created_at < NOW() - INTERVAL '30 days'
  `;
  // Keep 30 days for pro users; query-time filtering enforces free plan limits
  const [heartbeatChecksCount] = await sql`
    SELECT COUNT(*)::int AS count FROM heartbeat_checks
    WHERE checked_at < NOW() - INTERVAL '30 days'
  `;

  // Delete status checks older than 30 days
  await sql`
    DELETE FROM status_checks
    WHERE checked_at < NOW() - INTERVAL '30 days'
  `;

  // Delete resolved incidents older than 90 days
  await sql`
    DELETE FROM incidents
    WHERE status = 'resolved'
      AND resolved_at < NOW() - INTERVAL '90 days'
  `;

  // Delete rejected submissions older than 30 days
  await sql`
    DELETE FROM submissions
    WHERE status = 'rejected'
      AND created_at < NOW() - INTERVAL '30 days'
  `;

  // Delete heartbeat checks older than 30 days (pro plan retention)
  await sql`
    DELETE FROM heartbeat_checks
    WHERE checked_at < NOW() - INTERVAL '30 days'
  `;

  return NextResponse.json({
    ok: true,
    deleted: {
      status_checks: checksCount.count,
      incidents: incidentsCount.count,
      submissions: submissionsCount.count,
      heartbeat_checks: heartbeatChecksCount.count,
    },
  });
}
