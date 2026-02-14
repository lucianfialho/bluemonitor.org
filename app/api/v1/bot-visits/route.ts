import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { extractApiKeyOwner, withRateLimit } from "@/lib/api-helpers";
import { getUserPlanByApiKey } from "@/lib/plans";
import { isKnownBotName } from "@/lib/bots";

const MAX_BATCH_SIZE = 100;

interface BotVisit {
  bot_name: string;
  bot_category?: string;
  path: string;
  user_agent?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  const rlResponse = await withRateLimit(request);
  if (rlResponse) return rlResponse;

  const owner = await extractApiKeyOwner(request);
  if (!owner) {
    return NextResponse.json(
      { error: "Authentication required. Pass Authorization: Bearer bm_..." },
      { status: 401 }
    );
  }

  // Check Pro plan
  const plan = await getUserPlanByApiKey(owner.apiKey);
  if (!plan.limits.botTracking) {
    return NextResponse.json(
      { error: "Bot tracking requires a Pro plan. Upgrade at https://www.bluemonitor.org/pricing" },
      { status: 403 }
    );
  }

  let body: { domain?: string; visits?: BotVisit[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const domain = body.domain?.trim();
  if (!domain) {
    return NextResponse.json(
      { error: 'Missing "domain" field.' },
      { status: 400 }
    );
  }

  const visits = body.visits;
  if (!Array.isArray(visits) || visits.length === 0) {
    return NextResponse.json(
      { error: 'Missing or empty "visits" array.' },
      { status: 400 }
    );
  }

  if (visits.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      { error: `Max ${MAX_BATCH_SIZE} visits per batch.` },
      { status: 400 }
    );
  }

  const sql = getDb();
  let accepted = 0;

  for (const visit of visits) {
    if (!visit.bot_name || !visit.path) continue;
    if (!isKnownBotName(visit.bot_name)) continue;

    const botCategory = visit.bot_category || "other";
    const visitedAt = visit.timestamp ? new Date(visit.timestamp).toISOString() : new Date().toISOString();

    await sql`
      INSERT INTO bot_visits (user_id, domain, bot_name, bot_category, path, user_agent, visited_at)
      VALUES (${owner.userId}, ${domain}, ${visit.bot_name}, ${botCategory}, ${visit.path}, ${visit.user_agent || null}, ${visitedAt})
    `;
    accepted++;
  }

  return NextResponse.json({ ok: true, accepted });
}
