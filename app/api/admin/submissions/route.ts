import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const rows = await sql`SELECT * FROM submissions ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, promote, category } = await request.json();
  if (!["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const sql = getDb();

  if (promote && category) {
    // Get the submission data
    const submissions = await sql`SELECT * FROM submissions WHERE id = ${id}`;
    if (submissions.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const sub = submissions[0];
    const slug = slugify(sub.name as string);
    const domain = extractDomain(sub.url as string);
    const name = sub.name as string;
    const checkUrl = sub.url as string;
    const keywords = [
      `is ${name.toLowerCase()} down`,
      `${name.toLowerCase()} not working`,
      `${name.toLowerCase()} status`,
    ];

    // Insert into services table
    await sql`
      INSERT INTO services (slug, name, domain, category, check_url, keywords)
      VALUES (${slug}, ${name}, ${domain}, ${category}, ${checkUrl}, ${keywords})
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  // Update submission status
  await sql`UPDATE submissions SET status = ${status} WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  const sql = getDb();
  await sql`DELETE FROM submissions WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
