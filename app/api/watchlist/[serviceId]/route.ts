import { NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getUserPlan } from "@/lib/plans";

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

// PATCH: Toggle service visibility (private/public) — Pro only
export async function PATCH(
  request: Request,
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

  const body = await request.json();
  if (typeof body.is_private !== "boolean") {
    return NextResponse.json({ error: "is_private must be a boolean" }, { status: 400 });
  }

  const sql = getDb();

  // Verify the user has this service in their watchlist
  const watchlistCheck = await sql`
    SELECT 1 FROM watchlist WHERE user_id = ${session.user.id} AND service_id = ${id}
  `;
  if (watchlistCheck.length === 0) {
    return NextResponse.json({ error: "Service not in your watchlist" }, { status: 403 });
  }

  // Only Pro users can set private
  if (body.is_private) {
    const plan = await getUserPlan(session.user.id);
    if (!plan.limits.canSetPrivate) {
      return NextResponse.json(
        { error: "Private monitoring requires the Pro plan" },
        { status: 403 }
      );
    }
  }

  await sql`
    UPDATE services SET is_private = ${body.is_private} WHERE id = ${id}
  `;

  return NextResponse.json({ success: true, is_private: body.is_private });
}
