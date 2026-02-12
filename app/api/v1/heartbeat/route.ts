import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { extractApiKeyOwner, withRateLimit } from "@/lib/api-helpers";
import { determineStatusFromHealth } from "@/lib/check-service";
import { notifyStatusChanges, StatusChange } from "@/lib/notify-webhooks";
import { HealthEndpointResponse } from "@/lib/types";

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

  // Parse domain from query string
  const domain = request.nextUrl.searchParams.get("domain")?.trim();
  if (!domain) {
    return NextResponse.json(
      { error: "Missing ?domain= query parameter." },
      { status: 400 }
    );
  }

  // Parse body as HealthEndpointResponse
  let body: HealthEndpointResponse;
  try {
    const json = await request.json();
    if (!json || typeof json !== "object" || !("status" in json)) {
      return NextResponse.json(
        { error: 'Body must be JSON with at least a "status" field.' },
        { status: 400 }
      );
    }
    body = json as HealthEndpointResponse;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const sql = getDb();

  // Find the service and verify it's in the user's watchlist
  const rows = await sql`
    SELECT s.id, s.name, s.domain, s.current_status
    FROM services s
    JOIN watchlist w ON w.service_id = s.id AND w.user_id = ${owner.userId}
    WHERE s.domain = ${domain}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Service not found in your watchlist. Add it first from your dashboard." },
      { status: 404 }
    );
  }

  const service = rows[0];

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
