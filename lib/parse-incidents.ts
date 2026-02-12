export interface ParsedIncident {
  sourceId: string;
  title: string;
  description: string;
  severity: "minor" | "major" | "critical";
  status: "investigating" | "identified" | "monitoring" | "resolved";
  startedAt: string;
  resolvedAt: string | null;
  sourceUrl: string | null;
}

// Parse Statuspage/incident.io JSON API response
export function parseStatuspageIncidents(json: string, baseUrl: string): ParsedIncident[] {
  try {
    const data = JSON.parse(json);
    const incidents = data.incidents || [];

    return incidents.map((inc: Record<string, unknown>) => {
      const updates = (inc.incident_updates || []) as Record<string, unknown>[];
      const description = updates.length > 0
        ? (updates[0].body as string) || ""
        : "";

      return {
        sourceId: inc.id as string,
        title: inc.name as string,
        description,
        severity: mapSeverity(inc.impact as string),
        status: mapStatus(inc.status as string),
        startedAt: inc.started_at as string || inc.created_at as string,
        resolvedAt: (inc.resolved_at as string) || null,
        sourceUrl: inc.shortlink as string || `${baseUrl}/incidents/${inc.id}`,
      };
    });
  } catch {
    return [];
  }
}

// Parse RSS feed (Statuspage, Slack, AWS, etc.)
export function parseRssIncidents(xml: string, baseUrl: string): ParsedIncident[] {
  const incidents: ParsedIncident[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = extractTag(item, "title");
    const pubDate = extractTag(item, "pubDate");
    const link = extractTag(item, "link") || extractTag(item, "guid");
    const description = extractTag(item, "description");

    if (!title || !pubDate) continue;

    // Extract source ID from link or generate from title+date
    const sourceId = link
      ? link.split("/").pop() || `${hashString(title + pubDate)}`
      : `${hashString(title + pubDate)}`;

    const severity = guessSeverity(title + " " + (description || ""));
    const isResolved = /resolved|completed|fixed|recovered/i.test(title + " " + (description || ""));

    incidents.push({
      sourceId,
      title: cleanHtml(title),
      description: cleanHtml(description || ""),
      severity,
      status: isResolved ? "resolved" : "investigating",
      startedAt: new Date(pubDate).toISOString(),
      resolvedAt: isResolved ? new Date(pubDate).toISOString() : null,
      sourceUrl: link || baseUrl,
    });
  }

  return incidents;
}

// Parse Atom feed (Google, Hugging Face, etc.)
export function parseAtomIncidents(xml: string, baseUrl: string): ParsedIncident[] {
  const incidents: ParsedIncident[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const title = extractTag(entry, "title");
    const updated = extractTag(entry, "updated") || extractTag(entry, "published");
    const content = extractTag(entry, "content") || extractTag(entry, "summary");
    const id = extractTag(entry, "id");
    const linkMatch = entry.match(/<link[^>]*href="([^"]*)"[^>]*>/);
    const link = linkMatch ? linkMatch[1] : null;

    if (!title || !updated) continue;

    const sourceId = id || `${hashString(title + updated)}`;
    const severity = guessSeverity(title + " " + (content || ""));
    const isResolved = /resolved|completed|fixed|recovered/i.test(title + " " + (content || ""));

    incidents.push({
      sourceId: sourceId.split("/").pop() || sourceId,
      title: cleanHtml(title),
      description: cleanHtml(content || ""),
      severity,
      status: isResolved ? "resolved" : "investigating",
      startedAt: new Date(updated).toISOString(),
      resolvedAt: isResolved ? new Date(updated).toISOString() : null,
      sourceUrl: link || baseUrl,
    });
  }

  return incidents;
}

function mapSeverity(impact: string): ParsedIncident["severity"] {
  switch (impact) {
    case "critical": return "critical";
    case "major": return "major";
    default: return "minor";
  }
}

function mapStatus(status: string): ParsedIncident["status"] {
  switch (status) {
    case "investigating": return "investigating";
    case "identified": return "identified";
    case "monitoring": return "monitoring";
    default: return "resolved";
  }
}

function guessSeverity(text: string): ParsedIncident["severity"] {
  const lower = text.toLowerCase();
  if (/critical|major outage|fully down|complete/i.test(lower)) return "critical";
  if (/major|significant|widespread|degraded/i.test(lower)) return "major";
  return "minor";
}

function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i");
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
