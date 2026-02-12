import { NextRequest } from "next/server";
import { withRateLimit, apiResponse } from "@/lib/api-helpers";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const blocked = withRateLimit(request);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);
  const offset = parseInt(searchParams.get("offset") || "0");

  const sql = getDb();

  const services = category
    ? await sql`
        SELECT slug, name, domain, category, current_status, current_response_time, last_checked_at
        FROM services
        WHERE category = ${category}
        ORDER BY name
        LIMIT ${limit} OFFSET ${offset}
      `
    : await sql`
        SELECT slug, name, domain, category, current_status, current_response_time, last_checked_at
        FROM services
        ORDER BY name
        LIMIT ${limit} OFFSET ${offset}
      `;

  const countResult = category
    ? await sql`SELECT COUNT(*)::int as total FROM services WHERE category = ${category}`
    : await sql`SELECT COUNT(*)::int as total FROM services`;

  return apiResponse(request, {
    services: services.map((s) => ({
      slug: s.slug,
      name: s.name,
      domain: s.domain,
      category: s.category,
      status: s.current_status || "unknown",
      response_time: s.current_response_time,
      last_checked: s.last_checked_at,
    })),
    total: countResult[0].total,
    limit,
    offset,
  });
}
