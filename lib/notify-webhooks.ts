import { getDb } from "@/lib/db";

export interface StatusChange {
  serviceId: number;
  serviceName: string;
  domain: string;
  previousStatus: string;
  newStatus: string;
}

interface WebhookRow {
  url: string;
  type: string;
  events: string[];
}

function eventFromChange(change: StatusChange): string {
  if (change.newStatus === "dead") return "dead";
  if (change.previousStatus === "dead") return "resurrected";
  if (change.newStatus === "down") return "down";
  if (change.newStatus === "slow") return "slow";
  if (change.previousStatus === "down" || change.previousStatus === "slow")
    return "recovered";
  return "recovered";
}

function buildDiscordPayload(change: StatusChange, event: string) {
  const colors: Record<string, number> = {
    down: 0xef4444,
    slow: 0xeab308,
    recovered: 0x22c55e,
    dead: 0x374151,
    resurrected: 0x3b82f6,
  };
  const titles: Record<string, string> = {
    down: "Service Down",
    slow: "Service Slow",
    recovered: "Service Recovered",
    dead: "Service Unresponsive",
    resurrected: "Service Resurrected",
  };

  return {
    embeds: [
      {
        title: titles[event] || "Status Change",
        description: `**${change.serviceName}** (${change.domain})`,
        color: colors[event] || 0x6b7280,
        fields: [
          {
            name: "Previous Status",
            value: change.previousStatus,
            inline: true,
          },
          { name: "New Status", value: change.newStatus, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: "BlueMonitor" },
      },
    ],
  };
}

function buildSlackPayload(change: StatusChange, event: string) {
  const emojis: Record<string, string> = {
    down: ":red_circle:",
    slow: ":large_yellow_circle:",
    recovered: ":large_green_circle:",
    dead: ":skull:",
    resurrected: ":sparkles:",
  };

  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${emojis[event] || ":white_circle:"} *${change.serviceName}* (${change.domain})\nStatus: \`${change.previousStatus}\` → \`${change.newStatus}\``,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `BlueMonitor · ${new Date().toISOString()}`,
          },
        ],
      },
    ],
  };
}

function buildCustomPayload(change: StatusChange, event: string) {
  return {
    event,
    service: change.serviceName,
    domain: change.domain,
    status: change.newStatus,
    previous_status: change.previousStatus,
    timestamp: new Date().toISOString(),
  };
}

function buildPayload(
  type: string,
  change: StatusChange,
  event: string
): object {
  switch (type) {
    case "discord":
      return buildDiscordPayload(change, event);
    case "slack":
      return buildSlackPayload(change, event);
    default:
      return buildCustomPayload(change, event);
  }
}

async function sendWebhook(url: string, payload: object): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch {
    // fire-and-forget
  } finally {
    clearTimeout(timeout);
  }
}

export async function notifyStatusChanges(
  changes: StatusChange[]
): Promise<void> {
  if (changes.length === 0) return;

  const sql = getDb();
  const serviceIds = changes.map((c) => c.serviceId);

  const webhooks = (await sql`
    SELECT DISTINCT w.url, w.type, w.events
    FROM watchlist wl
    JOIN webhooks w ON w.user_id = wl.user_id AND w.active = true
    WHERE wl.service_id = ANY(${serviceIds}::int[])
  `) as WebhookRow[];

  if (webhooks.length === 0) return;

  const sends: Promise<void>[] = [];

  for (const change of changes) {
    const event = eventFromChange(change);
    for (const wh of webhooks) {
      if (!wh.events.includes(event)) continue;
      const payload = buildPayload(wh.type, change, event);
      sends.push(sendWebhook(wh.url, payload));
    }
  }

  await Promise.allSettled(sends);
}

// --- LLM Update notifications ---

export interface LlmUpdate {
  message: string;
  changes: string[];
}

function buildLlmDiscordPayload(update: LlmUpdate) {
  return {
    embeds: [
      {
        title: "LLM.txt Updated",
        description: update.message,
        color: 0x3b82f6,
        fields: update.changes.map((c) => ({
          name: "Change",
          value: c,
          inline: false,
        })),
        timestamp: new Date().toISOString(),
        footer: { text: "BlueMonitor" },
      },
    ],
  };
}

function buildLlmSlackPayload(update: LlmUpdate) {
  const changesList = update.changes.map((c) => `• ${c}`).join("\n");
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:page_facing_up: *LLM.txt Updated*\n${update.message}\n\n${changesList}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `BlueMonitor · ${new Date().toISOString()}`,
          },
        ],
      },
    ],
  };
}

function buildLlmCustomPayload(update: LlmUpdate) {
  return {
    event: "llm_update",
    message: update.message,
    changes: update.changes,
    llm_url: "https://www.bluemonitor.org/llm.txt",
    timestamp: new Date().toISOString(),
  };
}

function buildLlmPayload(type: string, update: LlmUpdate): object {
  switch (type) {
    case "discord":
      return buildLlmDiscordPayload(update);
    case "slack":
      return buildLlmSlackPayload(update);
    default:
      return buildLlmCustomPayload(update);
  }
}

export async function notifyLlmUpdate(update: LlmUpdate): Promise<number> {
  const sql = getDb();

  // Find all active webhooks that have llm_update event enabled
  const webhooks = (await sql`
    SELECT DISTINCT url, type, events
    FROM webhooks
    WHERE active = true
      AND 'llm_update' = ANY(events)
  `) as WebhookRow[];

  if (webhooks.length === 0) return 0;

  const sends: Promise<void>[] = [];
  for (const wh of webhooks) {
    const payload = buildLlmPayload(wh.type, update);
    sends.push(sendWebhook(wh.url, payload));
  }

  await Promise.allSettled(sends);
  return webhooks.length;
}

export async function sendTestWebhook(
  url: string,
  type: string
): Promise<void> {
  const testChange: StatusChange = {
    serviceId: 0,
    serviceName: "Test Service",
    domain: "example.com",
    previousStatus: "up",
    newStatus: "down",
  };
  const payload = buildPayload(type, testChange, "down");
  await sendWebhook(url, payload);
}
