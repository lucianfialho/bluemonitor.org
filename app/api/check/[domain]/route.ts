import { NextRequest, NextResponse } from "next/server";
import { checkService } from "@/lib/check-service";
import { getDb } from "@/lib/db";
import { notifyStatusChanges } from "@/lib/notify-webhooks";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;

  if (!domain || domain.length > 253) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const result = await checkService(domain);

  // Resurrect dead services that came back (best-effort, never blocks the response)
  if (result.status === "up" || result.status === "slow") {
    try {
      const sql = getDb();
      const deadServices = await sql`
        SELECT id, name FROM services WHERE domain = ${domain} AND current_status = 'dead'
      `;
      if (deadServices.length > 0) {
        const svc = deadServices[0];
        await sql`
          UPDATE services SET current_status = ${result.status}, current_response_time = ${result.responseTime}, last_checked_at = NOW() WHERE id = ${svc.id}
        `;
        notifyStatusChanges([{
          serviceId: svc.id,
          serviceName: svc.name,
          domain,
          previousStatus: "dead",
          newStatus: result.status,
        }]).catch(() => {});
      }
    } catch {
      // DB unavailable — skip resurrection
    }
  }

  const cacheControl =
    result.status === "down"
      ? "public, s-maxage=30, stale-while-revalidate=15"
      : "public, s-maxage=60, stale-while-revalidate=30";

  return NextResponse.json(result, {
    headers: { "Cache-Control": cacheControl },
  });
}
