import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const services = await sql`
    SELECT s.id, s.slug, s.name, s.domain, s.category, s.current_status,
           s.current_response_time, s.last_checked_at, w.added_at
    FROM watchlist w
    JOIN services s ON s.id = w.service_id
    WHERE w.user_id = ${session.user.id}
    ORDER BY w.added_at DESC
  `;

  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const serviceId = body.serviceId;

  if (!serviceId || typeof serviceId !== "number") {
    return NextResponse.json({ error: "Invalid serviceId" }, { status: 400 });
  }

  const sql = getDb();
  await sql`
    INSERT INTO watchlist (user_id, service_id)
    VALUES (${session.user.id}, ${serviceId})
    ON CONFLICT (user_id, service_id) DO NOTHING
  `;

  return NextResponse.json({ success: true });
}
