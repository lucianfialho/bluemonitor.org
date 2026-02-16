import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getUserPlan } from "@/lib/plans";

export async function GET(request: NextRequest) {
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

  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get("period") === "30d" ? 30 : 7;
  const domain = searchParams.get("domain");
  const sql = getDb();
  const userId = session.user.id;

  const rows = domain
    ? await sql`
      SELECT
        EXTRACT(HOUR FROM hour_bucket)::int AS hour,
        DATE(hour_bucket) AS day,
        bot_category,
        SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId}
        AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
      GROUP BY EXTRACT(HOUR FROM hour_bucket), DATE(hour_bucket), bot_category
      ORDER BY day, hour
    `
    : await sql`
      SELECT
        EXTRACT(HOUR FROM hour_bucket)::int AS hour,
        DATE(hour_bucket) AS day,
        bot_category,
        SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
      GROUP BY EXTRACT(HOUR FROM hour_bucket), DATE(hour_bucket), bot_category
      ORDER BY day, hour
    `;

  const points = rows.map((r) => ({
    hour: r.hour as number,
    day: r.day as string,
    category: r.bot_category as string,
    count: r.count as number,
  }));

  return NextResponse.json({ points });
}
