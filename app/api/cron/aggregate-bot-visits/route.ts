import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  // Aggregate raw bot_visits into bot_visits_hourly
  const aggregated = await sql`
    INSERT INTO bot_visits_hourly (user_id, domain, bot_name, bot_category, path, visit_count, hour_bucket)
    SELECT
      user_id,
      domain,
      bot_name,
      bot_category,
      path,
      COUNT(*)::int AS visit_count,
      date_trunc('hour', visited_at) AS hour_bucket
    FROM bot_visits
    GROUP BY user_id, domain, bot_name, bot_category, path, date_trunc('hour', visited_at)
    ON CONFLICT (user_id, domain, bot_name, path, hour_bucket)
    DO UPDATE SET visit_count = bot_visits_hourly.visit_count + EXCLUDED.visit_count
    RETURNING id
  `;

  // Delete all aggregated raw rows
  const [deletedRaw] = await sql`
    DELETE FROM bot_visits
    RETURNING COUNT(*)::int AS count
  `;

  // Delete hourly data older than 30 days
  const [deletedOld] = await sql`
    DELETE FROM bot_visits_hourly
    WHERE hour_bucket < NOW() - INTERVAL '30 days'
    RETURNING COUNT(*)::int AS count
  `;

  return NextResponse.json({
    ok: true,
    aggregated: aggregated.length,
    deleted_raw: deletedRaw?.count ?? 0,
    deleted_old: deletedOld?.count ?? 0,
  });
}
