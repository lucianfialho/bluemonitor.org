import { NextRequest } from "next/server";
import { withRateLimit, apiResponse } from "@/lib/api-helpers";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const blocked = withRateLimit(request);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  const status = searchParams.get("status");

  const sql = getDb();

  const incidents = status
    ? await sql`
        SELECT i.source_id, i.title, i.description, i.severity, i.status,
               i.started_at, i.resolved_at, i.source_url,
               s.name as service_name, s.slug as service_slug
        FROM incidents i
        JOIN services s ON s.id = i.service_id
        WHERE i.status = ${status}
        ORDER BY i.started_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    : await sql`
        SELECT i.source_id, i.title, i.description, i.severity, i.status,
               i.started_at, i.resolved_at, i.source_url,
               s.name as service_name, s.slug as service_slug
        FROM incidents i
        JOIN services s ON s.id = i.service_id
        ORDER BY i.started_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

  return apiResponse(request, {
    incidents: incidents.map((i) => ({
      id: i.source_id,
      title: i.title,
      description: i.description,
      severity: i.severity,
      status: i.status,
      started_at: i.started_at,
      resolved_at: i.resolved_at,
      source_url: i.source_url,
      service: {
        name: i.service_name,
        slug: i.service_slug,
      },
    })),
    limit,
    offset,
  });
}
