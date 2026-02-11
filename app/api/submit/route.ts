import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "Service name and URL are required" },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const sql = getDb();
    await sql`
      INSERT INTO submissions (name, url)
      VALUES (${name}, ${url})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SUBMIT_ERROR]", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
