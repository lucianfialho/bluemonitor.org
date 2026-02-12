import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkService } from "@/lib/check-service";
import { notifyStatusChanges, StatusChange } from "@/lib/notify-webhooks";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ServiceRow {
  id: number;
  domain: string;
  name: string;
  current_status: string | null;
  last_heartbeat_at: string | null;
}

interface CheckResult {
  serviceId: number;
  status: "up" | "down" | "slow";
  responseTime: number;
  statusCode: number;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const sql = getDb();

  // Skip services with recent heartbeats (they report their own status)
  const services = (await sql`
    SELECT id, name, domain, current_status, last_heartbeat_at
    FROM services
    WHERE (current_status IS NULL OR current_status != 'dead')
      AND (last_heartbeat_at IS NULL OR last_heartbeat_at < NOW() - INTERVAL '10 minutes')
  `) as ServiceRow[];
  const total = services.length;
  const results: CheckResult[] = [];
  const BATCH_SIZE = 50;
  const SAFETY_MS = 50000;

  for (let i = 0; i < services.length; i += BATCH_SIZE) {
    if (Date.now() - start > SAFETY_MS) break;

    const batch = services.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map(async (svc) => {
        const check = await checkService(svc.domain, 5000);
        return {
          serviceId: svc.id,
          status: check.status,
          responseTime: check.responseTime,
          statusCode: check.statusCode,
        } as CheckResult;
      })
    );

    for (const r of settled) {
      if (r.status === "fulfilled") {
        results.push(r.value);
      }
    }
  }

  if (results.length > 0) {
    const serviceIds = results.map((r) => r.serviceId);
    const statuses = results.map((r) => r.status);
    const responseTimes = results.map((r) => r.responseTime);
    const statusCodes = results.map((r) => r.statusCode);

    // Bulk insert status_checks
    await sql`
      INSERT INTO status_checks (service_id, status, response_time, status_code, checked_at)
      SELECT * FROM unnest(
        ${serviceIds}::int[],
        ${statuses}::varchar[],
        ${responseTimes}::int[],
        ${statusCodes}::smallint[],
        ${results.map(() => new Date().toISOString())}::timestamptz[]
      )
    `;

    // Bulk update services cache columns
    await sql`
      UPDATE services SET
        current_status = bulk.status,
        current_response_time = bulk.response_time,
        last_checked_at = NOW()
      FROM (
        SELECT * FROM unnest(
          ${serviceIds}::int[],
          ${statuses}::varchar[],
          ${responseTimes}::int[]
        ) AS t(id, status, response_time)
      ) AS bulk
      WHERE services.id = bulk.id
    `;

    // Detect status changes and notify webhooks
    const serviceMap = new Map(services.map((s) => [s.id, s]));
    const changes: StatusChange[] = [];
    for (const r of results) {
      const svc = serviceMap.get(r.serviceId);
      if (svc && svc.current_status && svc.current_status !== r.status) {
        changes.push({
          serviceId: r.serviceId,
          serviceName: svc.name,
          domain: svc.domain,
          previousStatus: svc.current_status,
          newStatus: r.status,
        });
      }
    }
    if (changes.length > 0) {
      notifyStatusChanges(changes).catch(() => {});
    }
  }

  // Detect stale heartbeats: services that used to send heartbeats but stopped
  const staleServices = (await sql`
    SELECT id, name, domain, current_status
    FROM services
    WHERE last_heartbeat_at IS NOT NULL
      AND last_heartbeat_at < NOW() - INTERVAL '10 minutes'
      AND current_status IS NOT NULL
      AND current_status NOT IN ('down', 'dead')
  `) as ServiceRow[];

  if (staleServices.length > 0) {
    const staleIds = staleServices.map((s) => s.id);
    const staleStatuses = staleServices.map(() => "down");
    const staleNow = new Date().toISOString();

    await sql`
      INSERT INTO status_checks (service_id, status, response_time, status_code, checked_at)
      SELECT * FROM unnest(
        ${staleIds}::int[],
        ${staleStatuses}::varchar[],
        ${staleServices.map(() => 0)}::int[],
        ${staleServices.map(() => 0)}::smallint[],
        ${staleServices.map(() => staleNow)}::timestamptz[]
      )
    `;

    await sql`
      UPDATE services
      SET current_status = 'down', current_response_time = 0, last_checked_at = NOW()
      WHERE id = ANY(${staleIds}::int[])
    `;

    const staleChanges: StatusChange[] = staleServices.map((s) => ({
      serviceId: s.id,
      serviceName: s.name,
      domain: s.domain,
      previousStatus: s.current_status!,
      newStatus: "down",
    }));
    notifyStatusChanges(staleChanges).catch(() => {});
  }

  const summary = {
    up: results.filter((r) => r.status === "up").length,
    down: results.filter((r) => r.status === "down").length,
    slow: results.filter((r) => r.status === "slow").length,
  };

  return NextResponse.json({
    checked: results.length,
    total,
    staleHeartbeats: staleServices.length,
    elapsed: Date.now() - start,
    summary,
  });
}
