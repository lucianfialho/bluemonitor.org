import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkService } from "@/lib/check-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ServiceRow {
  id: number;
  domain: string;
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

  const services = (await sql`SELECT id, domain FROM services`) as ServiceRow[];
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
  }

  const summary = {
    up: results.filter((r) => r.status === "up").length,
    down: results.filter((r) => r.status === "down").length,
    slow: results.filter((r) => r.status === "slow").length,
  };

  return NextResponse.json({
    checked: results.length,
    total,
    elapsed: Date.now() - start,
    summary,
  });
}
