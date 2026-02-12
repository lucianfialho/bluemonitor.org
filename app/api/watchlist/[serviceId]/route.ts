import { NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { serviceId } = await params;
  const id = parseInt(serviceId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid serviceId" }, { status: 400 });
  }

  const sql = getDb();
  await sql`
    DELETE FROM watchlist
    WHERE user_id = ${session.user.id} AND service_id = ${id}
  `;

  return NextResponse.json({ success: true });
}
