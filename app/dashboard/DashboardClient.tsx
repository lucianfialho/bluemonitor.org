"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ServiceIcon from "@/components/ServiceIcon";
import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";
import { Category } from "@/lib/types";
import { trackWebhookCreate, trackWebhookTest, trackApiKeyCreate } from "@/lib/analytics";
import SetupGuide from "./SetupGuide";

interface PlanInfo {
  tier: "free" | "pro";
  limits: {
    maxWatchlist: number; // -1 means unlimited
    maxWebhooks: number;
    allowedWebhookEvents: string[];
    rateLimitAuthenticated: number;
    historyRetentionDays: number;
    recheckIntervalMinutes: number;
    mcpAccess: boolean;
  };
  status: string;
  billingPeriod: string | null;
  currentPeriodEnd: string | null;
}

interface Webhook {
  id: number;
  url: string;
  type: "discord" | "slack" | "custom";
  events: string[];
  active: boolean;
  created_at: string;
}

interface ApiKey {
  id: number;
  name: string;
  key_preview: string;
  created_at: string;
  last_used_at: string | null;
}

interface WatchlistService {
  id: number;
  slug: string;
  name: string;
  domain: string;
  category: Category;
  current_status: "up" | "down" | "slow" | "dead" | null;
  current_response_time: number | null;
  last_checked_at: string | null;
  last_heartbeat_at: string | null;
  added_at: string;
}

export default function DashboardClient({
  user,
}: {
  user: { id: string; name: string; email: string; image?: string | null };
}) {
  const searchParams = useSearchParams();
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(
    searchParams.get("upgraded") === "true"
  );

  const [plan, setPlan] = useState<PlanInfo | null>(null);

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [watchlist, setWatchlist] = useState<WatchlistService[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookType, setWebhookType] = useState<"discord" | "slack" | "custom">("discord");
  const [webhookEvents, setWebhookEvents] = useState<string[]>(["down"]);
  const [creatingWebhook, setCreatingWebhook] = useState(false);
  const [testingWebhookId, setTestingWebhookId] = useState<number | null>(null);
  const [mcpCopied, setMcpCopied] = useState(false);

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/keys");
    const data = await res.json();
    setKeys(data.keys || []);
    setLoading(false);
  }, []);

  const fetchWatchlist = useCallback(async () => {
    const res = await fetch("/api/watchlist");
    const data = await res.json();
    setWatchlist(data.services || []);
    setWatchlistLoading(false);
  }, []);

  const fetchWebhooks = useCallback(async () => {
    const res = await fetch("/api/webhooks");
    const data = await res.json();
    setWebhooks(data.webhooks || []);
    setWebhooksLoading(false);
  }, []);

  const fetchPlan = useCallback(async () => {
    const res = await fetch("/api/user/plan");
    const data = await res.json();
    setPlan(data);
  }, []);

  useEffect(() => {
    fetchPlan();
    fetchKeys();
    fetchWatchlist();
    fetchWebhooks();
  }, [fetchPlan, fetchKeys, fetchWatchlist, fetchWebhooks]);

  async function createKey() {
    setCreating(true);
    setCreatedKey(null);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName || "Default" }),
    });
    const data = await res.json();
    if (data.key) {
      trackApiKeyCreate();
      setCreatedKey(data.key);
      setNewKeyName("");
      fetchKeys();
    }
    setCreating(false);
  }

  async function deleteKey(id: number) {
    await fetch(`/api/keys?id=${id}`, { method: "DELETE" });
    fetchKeys();
  }

  async function removeFromWatchlist(serviceId: number) {
    setWatchlist((prev) => prev.filter((s) => s.id !== serviceId));
    await fetch(`/api/watchlist/${serviceId}`, { method: "DELETE" });
  }

  async function createWebhook() {
    if (!webhookUrl) return;
    setCreatingWebhook(true);
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl, type: webhookType, events: webhookEvents }),
    });
    if (res.ok) {
      trackWebhookCreate();
      setWebhookUrl("");
      setWebhookEvents(["down"]);
      fetchWebhooks();
    }
    setCreatingWebhook(false);
  }

  async function deleteWebhook(id: number) {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
  }

  async function toggleWebhook(id: number, active: boolean) {
    setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, active } : w)));
    await fetch(`/api/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  }

  async function testWebhook(id: number) {
    setTestingWebhookId(id);
    await fetch(`/api/webhooks/${id}/test`, { method: "POST" });
    trackWebhookTest();
    setTestingWebhookId(null);
  }

  function toggleEvent(event: string) {
    setWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href="/"
          className="hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Home
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Dashboard</span>
      </nav>

      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Welcome, {user.name || user.email}.
        </p>
      </div>

      {/* Upgrade success banner */}
      {showUpgradeSuccess && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900 dark:bg-green-950/40">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Welcome to Pro! Your limits have been upgraded.
          </p>
          <button
            onClick={() => setShowUpgradeSuccess(false)}
            className="text-green-600 hover:text-green-800 dark:text-green-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Plan banner */}
      {plan?.tier === "pro" ? (
        <div className="mb-8 flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 px-5 py-4 dark:border-purple-900 dark:bg-purple-950/40">
          <div>
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
              <span className="mr-1.5 inline-block rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-bold text-white">PRO</span>
              Unlimited watchlist, {plan.limits.maxWebhooks} webhooks, {plan.limits.rateLimitAuthenticated} API req/min
            </p>
            {plan.status === "canceling" && plan.currentPeriodEnd && (
              <p className="mt-0.5 text-xs text-purple-700 dark:text-purple-300">
                Cancels on {new Date(plan.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <ManageSubscriptionButton />
        </div>
      ) : (
        <div className="mb-8 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-900 dark:bg-blue-950/40">
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Free plan — {plan?.limits.maxWatchlist ?? 3} watchlist services, {plan?.limits.maxWebhooks ?? 2} webhooks, 15 API req/min
            </p>
            <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
              Need more? Upgrade to Pro for unlimited watchlist and priority alerts.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Setup Guide */}
      <SetupGuide
        hasApiKey={keys.length > 0}
        apiKeyPreview={keys[0]?.key_preview ?? null}
        hasHeartbeatService={watchlist.some((s) => s.last_heartbeat_at !== null)}
        hasWebhook={webhooks.length > 0}
        onHeartbeatReceived={fetchWatchlist}
      />

      {/* Watchlist */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Your Watchlist
          </h2>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Browse services
          </Link>
        </div>

        {watchlistLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-5 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            Loading...
          </div>
        ) : watchlist.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Your watchlist is empty. Add services from any service page to monitor them here.
            </p>
            <Link
              href="/"
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Discover services
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {watchlist.map((service) => (
              <div
                key={service.id}
                className="group relative flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
              >
                <Link
                  href={`/status/${service.slug}`}
                  className="absolute inset-0 z-0"
                  aria-label={service.name}
                />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <ServiceIcon domain={service.domain} name={service.name} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                      {service.name}
                    </span>
                    {service.current_status && (
                      <span
                        className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                          service.current_status === "up"
                            ? "bg-green-500"
                            : service.current_status === "slow"
                              ? "bg-yellow-500"
                              : service.current_status === "dead"
                                ? "bg-zinc-500"
                                : "bg-red-500"
                        }`}
                        title={
                          service.current_status === "up"
                            ? "Operational"
                            : service.current_status === "slow"
                              ? "Slow"
                              : service.current_status === "dead"
                                ? "Unresponsive"
                                : "Down"
                        }
                      />
                    )}
                    {service.last_heartbeat_at && (
                      <span className="rounded bg-purple-100 px-1 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                        HEARTBEAT
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-zinc-500">{service.domain}</p>
                  {service.last_heartbeat_at && (
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                      {service.current_response_time !== null && (
                        <span>{service.current_response_time}ms</span>
                      )}
                      <span>
                        Last heartbeat{" "}
                        {(() => {
                          const diff = Date.now() - new Date(service.last_heartbeat_at).getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 1) return "just now";
                          if (mins < 60) return `${mins}m ago`;
                          const hours = Math.floor(mins / 60);
                          if (hours < 24) return `${hours}h ago`;
                          return `${Math.floor(hours / 24)}d ago`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromWatchlist(service.id);
                  }}
                  className="relative z-10 rounded-md p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                  title="Remove from watchlist"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Webhooks */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Webhooks
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {webhooks.length}/{plan?.limits.maxWebhooks ?? 2} max
          </span>
        </div>

        <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="url"
              placeholder="Webhook URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <select
              value={webhookType}
              onChange={(e) => setWebhookType(e.target.value as "discord" | "slack" | "custom")}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="discord">Discord</option>
              <option value="slack">Slack</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="mb-3 flex items-center gap-4">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Events:</span>
            {(["down", "slow", "recovered", "dead", "resurrected"] as const).map((event) => {
              const allowed = plan?.limits.allowedWebhookEvents?.includes(event) ?? event === "down";
              return (
                <label
                  key={event}
                  className={`flex items-center gap-1.5 text-sm ${!allowed ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-700 dark:text-zinc-300"}`}
                >
                  <input
                    type="checkbox"
                    checked={allowed && webhookEvents.includes(event)}
                    onChange={() => allowed && toggleEvent(event)}
                    disabled={!allowed}
                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 disabled:opacity-40 dark:border-zinc-600"
                  />
                  {event}
                  {!allowed && (
                    <span className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      PRO
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          <button
            onClick={createWebhook}
            disabled={creatingWebhook || !webhookUrl || webhookEvents.length === 0 || webhooks.length >= (plan?.limits.maxWebhooks ?? 2)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {creatingWebhook ? "Adding..." : "Add Webhook"}
          </button>
        </div>

        {webhooksLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-5 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            Loading...
          </div>
        ) : webhooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Add a webhook to get notified when services in your watchlist change status.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      wh.type === "discord"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                        : wh.type === "slack"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}>
                      {wh.type}
                    </span>
                    <span className="truncate text-sm text-zinc-900 dark:text-zinc-100">
                      {wh.url}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Events: {wh.events.join(", ")} · Created{" "}
                    {new Date(wh.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggleWebhook(wh.id, !wh.active)}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      wh.active
                        ? "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                        : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                    title={wh.active ? "Disable" : "Enable"}
                  >
                    {wh.active ? "On" : "Off"}
                  </button>
                  <button
                    onClick={() => testWebhook(wh.id)}
                    disabled={testingWebhookId === wh.id}
                    className="rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-950"
                  >
                    {testingWebhookId === wh.id ? "Sending..." : "Test"}
                  </button>
                  <button
                    onClick={() => deleteWebhook(wh.id)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MCP Integration */}
      <section className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            MCP Integration
          </h2>
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            PRO
          </span>
        </div>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Connect BlueMonitor to AI assistants like Claude, Cursor, or any MCP-compatible client.
          Use your API key to authenticate.
        </p>
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-300">
            <code>{`{
  "mcpServers": {
    "bluemonitor": {
      "url": "https://www.bluemonitor.org/api/mcp",
      "headers": {
        "Authorization": "Bearer ${keys[0]?.key_preview || "YOUR_API_KEY"}"
      }
    }
  }
}`}</code>
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                JSON.stringify(
                  {
                    mcpServers: {
                      bluemonitor: {
                        url: "https://www.bluemonitor.org/api/mcp",
                        headers: {
                          Authorization: "Bearer YOUR_API_KEY",
                        },
                      },
                    },
                  },
                  null,
                  2
                )
              );
              setMcpCopied(true);
              setTimeout(() => setMcpCopied(false), 2000);
            }}
            className="absolute right-3 top-3 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
          >
            {mcpCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Replace <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">YOUR_API_KEY</code> with
          your actual API key. Available tools: <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">list_services</code>,{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">check_status</code>,{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">list_watchlist</code>,{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">get_incidents</code>,{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">check_domain</code>
        </p>
      </section>

      {/* Create API Key */}
      <section className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Create API Key
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Key name (e.g. My App)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            maxLength={100}
          />
          <button
            onClick={createKey}
            disabled={creating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Key"}
          </button>
        </div>

        {createdKey && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
            <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-200">
              API key created! Copy it now — it won&apos;t be shown again.
            </p>
            <code className="block break-all rounded bg-green-100 px-3 py-2 text-sm text-green-900 dark:bg-green-900 dark:text-green-100">
              {createdKey}
            </code>
          </div>
        )}

        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {plan?.limits.rateLimitAuthenticated ?? 60} req/min with key.{" "}
          <Link href="/docs" className="text-blue-600 hover:underline">
            API docs
          </Link>
        </p>
      </section>

      {/* API Keys List */}
      <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Your API Keys
          </h2>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-zinc-500">
            Loading...
          </div>
        ) : keys.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-zinc-500">
            No API keys yet. Create one above to get started.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {k.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    <code>{k.key_preview}</code> · Created{" "}
                    {new Date(k.created_at).toLocaleDateString()}
                    {k.last_used_at && (
                      <>
                        {" "}
                        · Last used{" "}
                        {new Date(k.last_used_at).toLocaleDateString()}
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => deleteKey(k.id)}
                  className="rounded-md px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
