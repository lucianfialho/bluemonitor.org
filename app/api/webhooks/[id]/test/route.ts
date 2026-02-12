import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { sendTestWebhook } from "@/lib/notify-webhooks";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sql = getDb();

  const result = await sql`
    SELECT url, type FROM webhooks
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  const webhook = result[0];
  await sendTestWebhook(webhook.url, webhook.type);

  return NextResponse.json({ success: true });
}
