import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { authServer } from "@/lib/auth/server";
import { getUserPlan } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  // Determine retention based on user's plan (default 1 day for unauthenticated)
  let retentionDays = 1;
  try {
    const { data: session } = await authServer.getSession();
    if (session?.user) {
      const plan = await getUserPlan(session.user.id);
      retentionDays = plan.limits.historyRetentionDays;
    }
  } catch {
    // Not authenticated — use free retention
  }

  const sql = getDb();
  const interval = `${retentionDays} days`;

  const rows = await sql`
    SELECT hc.check_name, hc.status, hc.latency, hc.message, hc.checked_at
    FROM heartbeat_checks hc
    JOIN services s ON s.id = hc.service_id
    WHERE s.slug = ${slug}
      AND hc.checked_at > NOW() - CAST(${interval} AS INTERVAL)
    ORDER BY hc.checked_at ASC
  `;

  return NextResponse.json(rows, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
