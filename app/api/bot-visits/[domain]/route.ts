import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getUserPlan } from "@/lib/plans";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(session.user.id);
  if (!plan.limits.botTracking) {
    return NextResponse.json(
      { error: "Bot tracking requires a Pro plan." },
      { status: 403 }
    );
  }

  const { domain } = await params;
  const period = request.nextUrl.searchParams.get("period") === "30d" ? 30 : 7;
  const sql = getDb();

  // Timeline: hourly visit counts
  const timeline = await sql`
    SELECT hour_bucket, SUM(visit_count)::int AS count
    FROM bot_visits_hourly
    WHERE user_id = ${session.user.id}
      AND domain = ${domain}
      AND hour_bucket >= NOW() - make_interval(days => ${period})
    GROUP BY hour_bucket
    ORDER BY hour_bucket
  `;

  // Top bots by visit count
  const byBot = await sql`
    SELECT bot_name, bot_category, SUM(visit_count)::int AS count
    FROM bot_visits_hourly
    WHERE user_id = ${session.user.id}
      AND domain = ${domain}
      AND hour_bucket >= NOW() - make_interval(days => ${period})
    GROUP BY bot_name, bot_category
    ORDER BY count DESC
    LIMIT 20
  `;

  // Category distribution
  const byCategory = await sql`
    SELECT bot_category, SUM(visit_count)::int AS count
    FROM bot_visits_hourly
    WHERE user_id = ${session.user.id}
      AND domain = ${domain}
      AND hour_bucket >= NOW() - make_interval(days => ${period})
    GROUP BY bot_category
    ORDER BY count DESC
  `;

  // Top pages
  const topPages = await sql`
    SELECT path, SUM(visit_count)::int AS count
    FROM bot_visits_hourly
    WHERE user_id = ${session.user.id}
      AND domain = ${domain}
      AND hour_bucket >= NOW() - make_interval(days => ${period})
    GROUP BY path
    ORDER BY count DESC
    LIMIT 20
  `;

  return NextResponse.json({ timeline, by_bot: byBot, by_category: byCategory, top_pages: topPages });
}
