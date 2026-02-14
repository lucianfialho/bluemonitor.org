"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { trackApiKeyCreate } from "@/lib/analytics";
import { useDashboard } from "../DashboardContext";

interface ApiKey {
  id: number;
  name: string;
  key_preview: string;
  created_at: string;
  last_used_at: string | null;
}

export default function SettingsPage() {
  const { plan } = useDashboard();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [mcpCopied, setMcpCopied] = useState(false);

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/keys");
    const data = await res.json();
    setKeys(data.keys || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Settings
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          API keys and integrations.
        </p>
      </div>

      {/* MCP Integration */}
      <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
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
            className="absolute right-3 top-3 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400 transition-all duration-150 hover:bg-zinc-700 hover:text-zinc-200 active:scale-95"
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
      <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Key"}
          </button>
        </div>

        {createdKey && (
          <div className="mt-4 animate-[fadeSlideIn_0.3s_ease-out] rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
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
                  className="rounded-md px-3 py-1 text-xs font-medium text-red-600 transition-all duration-150 hover:bg-red-50 active:scale-95 dark:text-red-400 dark:hover:bg-red-950"
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
