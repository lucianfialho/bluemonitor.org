"use client";

import { useCallback, useEffect, useState } from "react";
import { trackWebhookCreate, trackWebhookTest } from "@/lib/analytics";
import { useDashboard } from "../DashboardContext";

interface Webhook {
  id: number;
  url: string;
  type: "discord" | "slack" | "custom";
  events: string[];
  active: boolean;
  created_at: string;
}

export default function WebhooksPage() {
  const { plan } = useDashboard();

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookType, setWebhookType] = useState<"discord" | "slack" | "custom">("discord");
  const [webhookEvents, setWebhookEvents] = useState<string[]>(["down"]);
  const [creatingWebhook, setCreatingWebhook] = useState(false);
  const [testingWebhookId, setTestingWebhookId] = useState<number | null>(null);
  const [editingWebhookId, setEditingWebhookId] = useState<number | null>(null);
  const [editWebhookUrl, setEditWebhookUrl] = useState("");
  const [editWebhookEvents, setEditWebhookEvents] = useState<string[]>([]);
  const [savingWebhook, setSavingWebhook] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    const res = await fetch("/api/webhooks");
    const data = await res.json();
    setWebhooks(data.webhooks || []);
    setWebhooksLoading(false);
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

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

  function startEditWebhook(wh: Webhook) {
    setEditingWebhookId(wh.id);
    setEditWebhookUrl(wh.url);
    setEditWebhookEvents([...wh.events]);
  }

  function toggleEditEvent(event: string) {
    setEditWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  async function saveWebhookEdit(id: number) {
    if (!editWebhookUrl || editWebhookEvents.length === 0) return;
    setSavingWebhook(true);
    const res = await fetch(`/api/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: editWebhookUrl, events: editWebhookEvents }),
    });
    if (res.ok) {
      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, url: editWebhookUrl, events: editWebhookEvents } : w
        )
      );
      setEditingWebhookId(null);
    }
    setSavingWebhook(false);
  }

  const allEvents = ["down", "slow", "recovered", "dead", "resurrected", "llm_update"] as const;

  function renderEventCheckboxes(
    selectedEvents: string[],
    onToggle: (event: string) => void,
  ) {
    return allEvents.map((event) => {
      const allowed = plan?.limits.allowedWebhookEvents?.includes(event) ?? event === "down";
      return (
        <label
          key={event}
          onClick={(e) => {
            if (!allowed) {
              e.preventDefault();
              window.location.href = "/pricing";
            }
          }}
          className={`flex items-center gap-1.5 text-sm ${!allowed ? "cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300" : "text-zinc-700 dark:text-zinc-300"}`}
        >
          <input
            type="checkbox"
            checked={allowed && selectedEvents.includes(event)}
            onChange={() => allowed && onToggle(event)}
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
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Webhooks
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Get notified when services change status.
          </p>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {webhooks.length}/{plan?.limits.maxWebhooks ?? 2} max
        </span>
      </div>

      {/* Create webhook form */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
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
        <div className="mb-3 flex flex-wrap items-center gap-4">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Events:</span>
          {renderEventCheckboxes(webhookEvents, toggleEvent)}
        </div>
        <button
          onClick={createWebhook}
          disabled={creatingWebhook || !webhookUrl || webhookEvents.length === 0 || webhooks.length >= (plan?.limits.maxWebhooks ?? 2)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
        >
          {creatingWebhook ? "Adding..." : "Add Webhook"}
        </button>
      </div>

      {/* Webhook list */}
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
            <div key={wh.id} className="px-5 py-3">
              {editingWebhookId === wh.id ? (
                <div className="space-y-3">
                  <input
                    type="url"
                    value={editWebhookUrl}
                    onChange={(e) => setEditWebhookUrl(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Events:</span>
                    {renderEventCheckboxes(editWebhookEvents, toggleEditEvent)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveWebhookEdit(wh.id)}
                      disabled={savingWebhook || !editWebhookUrl || editWebhookEvents.length === 0}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-150 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
                    >
                      {savingWebhook ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingWebhookId(null)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
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
                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    <button
                      onClick={() => toggleWebhook(wh.id, !wh.active)}
                      className={`rounded-md px-2 py-1 text-xs font-medium transition-all duration-150 active:scale-95 ${
                        wh.active
                          ? "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                          : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                      title={wh.active ? "Disable" : "Enable"}
                    >
                      {wh.active ? "On" : "Off"}
                    </button>
                    <button
                      onClick={() => startEditWebhook(wh)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => testWebhook(wh.id)}
                      disabled={testingWebhookId === wh.id}
                      className="rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition-all duration-150 hover:bg-blue-50 active:scale-95 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-950"
                    >
                      {testingWebhookId === wh.id ? "Sending..." : "Test"}
                    </button>
                    <button
                      onClick={() => deleteWebhook(wh.id)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-all duration-150 hover:bg-red-50 active:scale-95 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
