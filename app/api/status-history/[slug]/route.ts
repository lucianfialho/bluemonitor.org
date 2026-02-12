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

  const rows = await sql`
    SELECT sc.status, sc.response_time, sc.status_code, sc.checked_at
    FROM status_checks sc
    JOIN services s ON s.id = sc.service_id
    WHERE s.slug = ${slug}
      AND sc.checked_at > NOW() - INTERVAL '24 hours'
    ORDER BY sc.checked_at ASC
  `;

  return NextResponse.json(rows, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
