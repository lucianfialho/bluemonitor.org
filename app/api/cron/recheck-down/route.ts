import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkService } from "@/lib/check-service";
import { notifyStatusChanges, StatusChange } from "@/lib/notify-webhooks";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface ServiceRow {
  id: number;
  name: string;
  domain: string;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  const services = (await sql`
    SELECT id, name, domain FROM services WHERE current_status = 'down'
  `) as ServiceRow[];

  if (services.length === 0) {
    return NextResponse.json({ checked: 0, recovered: 0, stillDown: 0 });
  }

  const settled = await Promise.allSettled(
    services.map(async (svc) => {
      const check = await checkService(svc.domain, 5000);
      return {
        serviceId: svc.id,
        status: check.status,
        responseTime: check.responseTime,
        statusCode: check.statusCode,
      };
    })
  );

  const results = settled
    .filter((r): r is PromiseFulfilledResult<{ serviceId: number; status: "up" | "down" | "slow"; responseTime: number; statusCode: number }> => r.status === "fulfilled")
    .map((r) => r.value);

  if (results.length > 0) {
    const serviceIds = results.map((r) => r.serviceId);
    const statuses = results.map((r) => r.status);
    const responseTimes = results.map((r) => r.responseTime);
    const statusCodes = results.map((r) => r.statusCode);

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

  const recoveredResults = results.filter((r) => r.status !== "down");
  const stillDown = results.filter((r) => r.status === "down").length;

  // Notify webhooks for recovered services
  if (recoveredResults.length > 0) {
    const serviceMap = new Map(services.map((s) => [s.id, s]));
    const changes: StatusChange[] = [];
    for (const r of recoveredResults) {
      const svc = serviceMap.get(r.serviceId);
      if (!svc) continue;
      changes.push({
        serviceId: r.serviceId,
        serviceName: svc.name,
        domain: svc.domain,
        previousStatus: "down",
        newStatus: r.status,
      });
    }

    if (changes.length > 0) {
      notifyStatusChanges(changes).catch(() => {});
    }
  }

  return NextResponse.json({
    checked: results.length,
    recovered: recoveredResults.length,
    stillDown,
  });
}
