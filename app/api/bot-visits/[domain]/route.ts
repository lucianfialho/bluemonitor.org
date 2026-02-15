import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getUserPlan } from "@/lib/plans";
import { calculateAIVisibility } from "@/lib/ai-visibility";

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
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get("period") === "30d" ? 30 : 7;
  const categoryFilter = searchParams.get("category") || null;
  const botNameFilter = searchParams.get("bot_name") || null;
  const compare = searchParams.get("compare") === "true";
  const sql = getDb();

  const userId = session.user.id;

  // Timeline: hourly visit counts
  const timeline = categoryFilter && botNameFilter
    ? await sql`
      SELECT hour_bucket, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
        AND bot_name = ${botNameFilter}
      GROUP BY hour_bucket ORDER BY hour_bucket
    `
    : categoryFilter
    ? await sql`
      SELECT hour_bucket, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
      GROUP BY hour_bucket ORDER BY hour_bucket
    `
    : botNameFilter
    ? await sql`
      SELECT hour_bucket, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_name = ${botNameFilter}
      GROUP BY hour_bucket ORDER BY hour_bucket
    `
    : await sql`
      SELECT hour_bucket, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
      GROUP BY hour_bucket ORDER BY hour_bucket
    `;

  // Timeline by category (for multi-series chart)
  const timelineByCategoryRows = categoryFilter && botNameFilter
    ? await sql`
      SELECT hour_bucket, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
        AND bot_name = ${botNameFilter}
      GROUP BY hour_bucket, bot_category ORDER BY hour_bucket
    `
    : categoryFilter
    ? await sql`
      SELECT hour_bucket, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
      GROUP BY hour_bucket, bot_category ORDER BY hour_bucket
    `
    : botNameFilter
    ? await sql`
      SELECT hour_bucket, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_name = ${botNameFilter}
      GROUP BY hour_bucket, bot_category ORDER BY hour_bucket
    `
    : await sql`
      SELECT hour_bucket, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
      GROUP BY hour_bucket, bot_category ORDER BY hour_bucket
    `;

  // Group timeline_by_category into Record<string, {hour_bucket, count}[]>
  const timelineByCategory: Record<string, { hour_bucket: string; count: number }[]> = {};
  for (const row of timelineByCategoryRows) {
    const cat = row.bot_category as string;
    if (!timelineByCategory[cat]) timelineByCategory[cat] = [];
    timelineByCategory[cat].push({ hour_bucket: row.hour_bucket, count: row.count });
  }

  // Top bots by visit count
  const byBot = categoryFilter && botNameFilter
    ? await sql`
      SELECT bot_name, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
        AND bot_name = ${botNameFilter}
      GROUP BY bot_name, bot_category ORDER BY count DESC LIMIT 20
    `
    : categoryFilter
    ? await sql`
      SELECT bot_name, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
      GROUP BY bot_name, bot_category ORDER BY count DESC LIMIT 20
    `
    : botNameFilter
    ? await sql`
      SELECT bot_name, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_name = ${botNameFilter}
      GROUP BY bot_name, bot_category ORDER BY count DESC LIMIT 20
    `
    : await sql`
      SELECT bot_name, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
      GROUP BY bot_name, bot_category ORDER BY count DESC LIMIT 20
    `;

  // Category distribution
  const byCategory = categoryFilter && botNameFilter
    ? await sql`
      SELECT bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
        AND bot_name = ${botNameFilter}
      GROUP BY bot_category ORDER BY count DESC
    `
    : categoryFilter
    ? await sql`
      SELECT bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
      GROUP BY bot_category ORDER BY count DESC
    `
    : botNameFilter
    ? await sql`
      SELECT bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_name = ${botNameFilter}
      GROUP BY bot_category ORDER BY count DESC
    `
    : await sql`
      SELECT bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
      GROUP BY bot_category ORDER BY count DESC
    `;

  // Top pages
  const topPages = categoryFilter && botNameFilter
    ? await sql`
      SELECT path, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
        AND bot_name = ${botNameFilter}
      GROUP BY path ORDER BY count DESC LIMIT 20
    `
    : categoryFilter
    ? await sql`
      SELECT path, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
      GROUP BY path ORDER BY count DESC LIMIT 20
    `
    : botNameFilter
    ? await sql`
      SELECT path, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_name = ${botNameFilter}
      GROUP BY path ORDER BY count DESC LIMIT 20
    `
    : await sql`
      SELECT path, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
      GROUP BY path ORDER BY count DESC LIMIT 20
    `;

  // Pages with per-bot breakdown
  const pagesWithBotsRows = categoryFilter && botNameFilter
    ? await sql`
      SELECT path, bot_name, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
        AND bot_name = ${botNameFilter}
      GROUP BY path, bot_name, bot_category ORDER BY count DESC
    `
    : categoryFilter
    ? await sql`
      SELECT path, bot_name, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_category = ${categoryFilter}
      GROUP BY path, bot_name, bot_category ORDER BY count DESC
    `
    : botNameFilter
    ? await sql`
      SELECT path, bot_name, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
        AND bot_name = ${botNameFilter}
      GROUP BY path, bot_name, bot_category ORDER BY count DESC
    `
    : await sql`
      SELECT path, bot_name, bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period})
      GROUP BY path, bot_name, bot_category ORDER BY count DESC
    `;

  // Group pages_with_bots into {path, count, bots}[]
  const pagesMap = new Map<string, { path: string; count: number; bots: { bot_name: string; bot_category: string; count: number }[] }>();
  for (const row of pagesWithBotsRows) {
    const p = row.path as string;
    if (!pagesMap.has(p)) {
      pagesMap.set(p, { path: p, count: 0, bots: [] });
    }
    const entry = pagesMap.get(p)!;
    entry.count += row.count as number;
    entry.bots.push({ bot_name: row.bot_name, bot_category: row.bot_category, count: row.count });
  }
  const pagesWithBots = [...pagesMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Comparison data (previous period)
  let comparison = undefined;
  if (compare) {
    const prevByCategory = await sql`
      SELECT bot_category, SUM(visit_count)::int AS count
      FROM bot_visits_hourly
      WHERE user_id = ${userId} AND domain = ${domain}
        AND hour_bucket >= NOW() - make_interval(days => ${period * 2})
        AND hour_bucket < NOW() - make_interval(days => ${period})
      GROUP BY bot_category ORDER BY count DESC
    `;
    const previousTotal = prevByCategory.reduce((sum, r) => sum + (r.count as number), 0);
    comparison = {
      previous_total: previousTotal,
      previous_by_category: prevByCategory,
    };
  }

  // AI Visibility Score
  const [aiCurrentRow] = await sql`
    SELECT COUNT(DISTINCT bot_name)::int AS distinct_bots,
           COUNT(DISTINCT path)::int AS distinct_pages,
           COALESCE(SUM(visit_count), 0)::int AS total_visits,
           array_agg(DISTINCT bot_name) AS visiting_bots
    FROM bot_visits_hourly
    WHERE user_id = ${userId} AND domain = ${domain}
      AND bot_category = 'ai_crawler'
      AND hour_bucket >= NOW() - make_interval(days => ${period})
  `;

  const [aiPrevRow] = await sql`
    SELECT COALESCE(SUM(visit_count), 0)::int AS total_visits
    FROM bot_visits_hourly
    WHERE user_id = ${userId} AND domain = ${domain}
      AND bot_category = 'ai_crawler'
      AND hour_bucket >= NOW() - make_interval(days => ${period * 2})
      AND hour_bucket < NOW() - make_interval(days => ${period})
  `;

  const aiVisibility = calculateAIVisibility(
    {
      distinct_bots: aiCurrentRow.distinct_bots ?? 0,
      distinct_pages: aiCurrentRow.distinct_pages ?? 0,
      total_visits: aiCurrentRow.total_visits ?? 0,
      visiting_bots: (aiCurrentRow.visiting_bots as string[] | null)?.filter(Boolean) ?? [],
      prev_total_visits: aiPrevRow.total_visits ?? 0,
    },
    period,
  );

  return NextResponse.json({
    timeline,
    timeline_by_category: timelineByCategory,
    by_bot: byBot,
    by_category: byCategory,
    top_pages: topPages,
    pages_with_bots: pagesWithBots,
    ai_visibility: aiVisibility,
    ...(comparison ? { comparison } : {}),
  });
}
