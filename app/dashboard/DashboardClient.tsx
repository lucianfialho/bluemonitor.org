"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface ApiKey {
  id: number;
  name: string;
  key_preview: string;
  created_at: string;
  last_used_at: string | null;
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
          Welcome, {user.name || user.email}. Manage your API keys below.
        </p>
      </div>

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
