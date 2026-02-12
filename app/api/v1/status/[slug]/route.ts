import { NextRequest } from "next/server";
import { getServiceBySlug } from "@/lib/services";
import { withRateLimit, apiResponse } from "@/lib/api-helpers";
import { getDb } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const blocked = await withRateLimit(request);
  if (blocked) return blocked;

  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return apiResponse(request, { error: "Service not found" }, { cacheSecs: 10 });
  }

  // Get latest check from status_checks for more detail
  const sql = getDb();
  const checks = await sql`
    SELECT status, response_time, status_code, checked_at
    FROM status_checks
    WHERE service_id = ${service.id}
    ORDER BY checked_at DESC
    LIMIT 1
  `;

  const latestCheck = checks[0] || null;

  return apiResponse(request, {
    slug: service.slug,
    name: service.name,
    domain: service.domain,
    category: service.category,
    status: service.current_status || "unknown",
    response_time: service.current_response_time,
    last_checked: service.last_checked_at,
    latest_check: latestCheck
      ? {
          status: latestCheck.status,
          response_time: latestCheck.response_time,
          status_code: latestCheck.status_code,
          checked_at: latestCheck.checked_at,
        }
      : null,
  });
}
