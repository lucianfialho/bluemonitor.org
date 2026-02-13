import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const sql = getDb();

  // Free plan: 1-day retention
  const rows = await sql`
    SELECT hc.check_name, hc.status, hc.latency, hc.message, hc.checked_at
    FROM heartbeat_checks hc
    JOIN services s ON s.id = hc.service_id
    WHERE s.slug = ${slug}
      AND hc.checked_at > NOW() - INTERVAL '1 day'
    ORDER BY hc.checked_at ASC
  `;

  return NextResponse.json(rows, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
