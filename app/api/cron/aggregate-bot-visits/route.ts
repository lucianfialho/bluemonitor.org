import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { notifyGooglebotInactive } from "@/lib/notify-webhooks";

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

  // Googlebot inactivity detection:
  // Find user+domain combos that have at least 7 days of bot data
  // but no Googlebot visit in the last 48 hours,
  // and haven't been alerted in the last 48 hours.
  const inactiveRows = await sql`
    SELECT
      bvh.user_id,
      bvh.domain,
      MAX(CASE WHEN bvh.bot_name = 'googlebot' THEN bvh.hour_bucket END) AS last_seen_at
    FROM bot_visits_hourly bvh
    WHERE bvh.hour_bucket >= NOW() - INTERVAL '30 days'
    GROUP BY bvh.user_id, bvh.domain
    HAVING
      MIN(bvh.hour_bucket) <= NOW() - INTERVAL '7 days'
      AND (
        MAX(CASE WHEN bvh.bot_name = 'googlebot' THEN bvh.hour_bucket END) IS NULL
        OR MAX(CASE WHEN bvh.bot_name = 'googlebot' THEN bvh.hour_bucket END) < NOW() - INTERVAL '48 hours'
      )
  `;

  let googlebotAlertsSent = 0;
  for (const row of inactiveRows) {
    const userId = row.user_id as string;
    const domain = row.domain as string;
    const lastSeenAt = row.last_seen_at as string | null;

    // Check if already alerted in last 48h
    const [alertState] = await sql`
      SELECT last_alerted_at FROM bot_alert_state
      WHERE user_id = ${userId} AND domain = ${domain} AND alert_type = 'googlebot_inactive'
    `;
    if (alertState?.last_alerted_at) {
      const lastAlerted = new Date(alertState.last_alerted_at as string);
      if (Date.now() - lastAlerted.getTime() < 48 * 60 * 60 * 1000) continue;
    }

    const hoursInactive = lastSeenAt
      ? Math.round((Date.now() - new Date(lastSeenAt).getTime()) / (60 * 60 * 1000))
      : 999;

    const sent = await notifyGooglebotInactive({
      userId,
      domain,
      lastSeenAt: lastSeenAt ?? null,
      hoursInactive,
    });

    if (sent > 0) {
      await sql`
        INSERT INTO bot_alert_state (user_id, domain, alert_type, last_alerted_at)
        VALUES (${userId}, ${domain}, 'googlebot_inactive', NOW())
        ON CONFLICT (user_id, domain, alert_type)
        DO UPDATE SET last_alerted_at = NOW()
      `;
      googlebotAlertsSent++;
    }
  }

  return NextResponse.json({
    ok: true,
    aggregated: aggregated.length,
    deleted_raw: deletedRaw?.count ?? 0,
    deleted_old: deletedOld?.count ?? 0,
    googlebot_alerts_sent: googlebotAlertsSent,
  });
}
