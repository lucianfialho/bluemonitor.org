import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { extractApiKeyOwner, withRateLimit } from "@/lib/api-helpers";
import { determineStatusFromHealth } from "@/lib/check-service";
import { notifyStatusChanges, StatusChange } from "@/lib/notify-webhooks";
import { HealthEndpointResponse } from "@/lib/types";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  // Rate limit
  const rlResponse = await withRateLimit(request);
  if (rlResponse) return rlResponse;

  // Require API key
  const owner = await extractApiKeyOwner(request);
  if (!owner) {
    return NextResponse.json(
      { error: "Authentication required. Pass Authorization: Bearer bm_..." },
      { status: 401 }
    );
  }

  // Parse body
  let body: HealthEndpointResponse & { domain?: string };
  try {
    const json = await request.json();
    if (!json || typeof json !== "object" || !("status" in json)) {
      return NextResponse.json(
        { error: 'Body must be JSON with at least "status" and "domain" fields.' },
        { status: 400 }
      );
    }
    body = json as HealthEndpointResponse & { domain?: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // Domain from body, fallback to query string for backwards compatibility
  const domain = body.domain?.trim() || request.nextUrl.searchParams.get("domain")?.trim();
  if (!domain) {
    return NextResponse.json(
      { error: 'Missing "domain" field in request body.' },
      { status: 400 }
    );
  }

  const sql = getDb();

  // Find the service by domain
  let rows = await sql`
    SELECT id, name, domain, current_status
    FROM services
    WHERE domain = ${domain}
    LIMIT 1
  `;

  // Auto-register service if it doesn't exist
  if (rows.length === 0) {
    const name = domain.replace(/\.[^.]+$/, "").replace(/[.-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const slug = slugify(domain);
    const checkUrl = `https://${domain}`;

    const inserted = await sql`
      INSERT INTO services (slug, name, domain, category, check_url, keywords)
      VALUES (${slug}, ${name}, ${domain}, 'other', ${checkUrl}, ${[`is ${name.toLowerCase()} down`, `${name.toLowerCase()} status`]})
      ON CONFLICT (slug) DO UPDATE SET slug = services.slug
      RETURNING id, name, domain, current_status
    `;
    rows = inserted;
  }

  const service = rows[0];

  // Auto-add to watchlist if not already there (respects free tier limit)
  const watchlistCheck = await sql`
    SELECT 1 FROM watchlist WHERE user_id = ${owner.userId} AND service_id = ${service.id}
  `;
  if (watchlistCheck.length === 0) {
    await sql`
      INSERT INTO watchlist (user_id, service_id)
      VALUES (${owner.userId}, ${service.id})
      ON CONFLICT (user_id, service_id) DO NOTHING
    `;
  }

  // Determine status from reported health data
  const maxLatency = body.checks
    ? Math.max(
        0,
        ...Object.values(body.checks).map((c) => c.latency ?? 0)
      )
    : 0;

  const status = determineStatusFromHealth(body, 200, maxLatency);
  const now = new Date().toISOString();

  // Insert status check
  await sql`
    INSERT INTO status_checks (service_id, status, response_time, status_code, checked_at)
    VALUES (${service.id}, ${status}, ${maxLatency}, 200, ${now})
  `;

  // Update service cache columns
  await sql`
    UPDATE services
    SET current_status = ${status},
        current_response_time = ${maxLatency},
        last_checked_at = ${now},
        last_heartbeat_at = ${now}
    WHERE id = ${service.id}
  `;

  // Detect status change → trigger webhooks
  if (service.current_status && service.current_status !== status) {
    const changes: StatusChange[] = [
      {
        serviceId: service.id as number,
        serviceName: service.name as string,
        domain: service.domain as string,
        previousStatus: service.current_status as string,
        newStatus: status,
      },
    ];
    notifyStatusChanges(changes).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    service: service.name,
    status,
    response_time: maxLatency,
    checked_at: now,
  });
}
