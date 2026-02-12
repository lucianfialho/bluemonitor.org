import { NextRequest } from "next/server";
import { withRateLimit, apiResponse } from "@/lib/api-helpers";
import { getDb } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const blocked = withRateLimit(request);
  if (blocked) return blocked;

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const sql = getDb();

  const services = await sql`SELECT id, name, slug FROM services WHERE slug = ${slug}`;
  if (services.length === 0) {
    return apiResponse(request, { error: "Service not found" }, { cacheSecs: 10 });
  }

  const service = services[0];

  const incidents = await sql`
    SELECT source_id, title, description, severity, status,
           started_at, resolved_at, source_url
    FROM incidents
    WHERE service_id = ${service.id}
    ORDER BY started_at DESC
    LIMIT ${limit}
  `;

  return apiResponse(request, {
    service: { name: service.name, slug: service.slug },
    incidents: incidents.map((i) => ({
      id: i.source_id,
      title: i.title,
      description: i.description,
      severity: i.severity,
      status: i.status,
      started_at: i.started_at,
      resolved_at: i.resolved_at,
      source_url: i.source_url,
    })),
  });
}
