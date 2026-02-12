"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ServiceIcon from "@/components/ServiceIcon";
import { Category } from "@/lib/types";

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
  current_status: "up" | "down" | "slow" | null;
  current_response_time: number | null;
  last_checked_at: string | null;
  added_at: string;
}

export default function DashboardClient({
  user,
}: {
  user: { id: string; name: string; email: string; image?: string | null };
}) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [watchlist, setWatchlist] = useState<WatchlistService[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

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

  useEffect(() => {
    fetchKeys();
    fetchWatchlist();
  }, [fetchKeys, fetchWatchlist]);

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
                              : "bg-red-500"
                        }`}
                        title={
                          service.current_status === "up"
                            ? "Operational"
                            : service.current_status === "slow"
                              ? "Slow"
                              : "Down"
                        }
                      />
                    )}
                  </div>
                  <p className="truncate text-xs text-zinc-500">{service.domain}</p>
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
          Authenticated requests get <strong>300 req/min</strong> (vs 60/min
          without a key).{" "}
          <Link href="/docs" className="text-blue-600 hover:underline">
            See API docs
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
