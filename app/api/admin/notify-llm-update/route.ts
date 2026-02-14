import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { notifyLlmUpdate } from "@/lib/notify-webhooks";

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { message?: string; changes?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = body.message?.trim();
  const changes = body.changes;

  if (!message || !Array.isArray(changes) || changes.length === 0) {
    return NextResponse.json(
      { error: 'Required fields: "message" (string) and "changes" (string[]).' },
      { status: 400 }
    );
  }

  const notified = await notifyLlmUpdate({ message, changes });

  return NextResponse.json({ ok: true, webhooks_notified: notified });
}
