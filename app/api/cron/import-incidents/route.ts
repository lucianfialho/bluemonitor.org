import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  ParsedIncident,
  parseStatuspageIncidents,
  parseRssIncidents,
  parseAtomIncidents,
} from "@/lib/parse-incidents";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface FeedService {
  id: number;
  slug: string;
  feed_url: string | null;
  feed_api_url: string | null;
  feed_provider: string;
  status_page_url: string;
}

async function fetchFeed(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "BlueMonitor/1.0 (incident import)" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchIncidents(svc: FeedService): Promise<ParsedIncident[]> {
  const baseUrl = svc.status_page_url;

  // Prefer JSON API for Statuspage/incident.io
  if (svc.feed_api_url && svc.feed_provider === "statuspage") {
    const apiUrl = svc.feed_api_url.replace("summary.json", "incidents.json");
    const json = await fetchFeed(apiUrl);
    if (json && json.startsWith("{")) {
      return parseStatuspageIncidents(json, baseUrl);
    }
  }

  // Fallback to feed URL
  if (svc.feed_url) {
    const content = await fetchFeed(svc.feed_url);
    if (!content) return [];

    if (svc.feed_provider === "atom" || content.includes("<feed")) {
      return parseAtomIncidents(content, baseUrl);
    }
    return parseRssIncidents(content, baseUrl);
  }

  return [];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const sql = getDb();

  const services = (await sql`
    SELECT id, slug, feed_url, feed_api_url, feed_provider, status_page_url
    FROM services
    WHERE feed_url IS NOT NULL OR feed_api_url IS NOT NULL
  `) as FeedService[];

  let totalImported = 0;
  let totalSkipped = 0;
  let errors = 0;
  const BATCH_SIZE = 20;
  const SAFETY_MS = 50000;

  for (let i = 0; i < services.length; i += BATCH_SIZE) {
    if (Date.now() - start > SAFETY_MS) break;

    const batch = services.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map(async (svc) => {
        const incidents = await fetchIncidents(svc);
        // Only import incidents from last 30 days
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const recent = incidents.filter((inc) => inc.startedAt > cutoff);
        return { serviceId: svc.id, incidents: recent };
      })
    );

    for (const r of settled) {
      if (r.status !== "fulfilled") {
        errors++;
        continue;
      }

      const { serviceId, incidents } = r.value;
      for (const inc of incidents) {
        try {
          const result = await sql`
            INSERT INTO incidents (service_id, source_id, title, description, severity, status, started_at, resolved_at, source_url)
            VALUES (${serviceId}, ${inc.sourceId}, ${inc.title}, ${inc.description}, ${inc.severity}, ${inc.status}, ${inc.startedAt}, ${inc.resolvedAt}, ${inc.sourceUrl})
            ON CONFLICT (service_id, source_id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              severity = EXCLUDED.severity,
              status = EXCLUDED.status,
              resolved_at = EXCLUDED.resolved_at
          `;
          // neon returns array, check if it was an insert vs update
          if (result.length === 0) {
            totalImported++;
          } else {
            totalImported++;
          }
        } catch {
          totalSkipped++;
        }
      }
    }
  }

  return NextResponse.json({
    services: services.length,
    imported: totalImported,
    skipped: totalSkipped,
    errors,
    elapsed: Date.now() - start,
  });
}
