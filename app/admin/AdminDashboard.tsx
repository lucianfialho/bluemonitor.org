"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Submission {
  id: number;
  name: string;
  url: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    const res = await fetch("/api/admin/submissions");
    if (res.ok) {
      setSubmissions(await res.json());
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    await fetch("/api/admin/submissions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Submissions ({submissions.length})
        </h1>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : submissions.length === 0 ? (
        <p className="text-zinc-500">No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {sub.name}
                </p>
                <a
                  href={sub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  {sub.url}
                </a>
                <p className="mt-1 text-xs text-zinc-400">
                  {new Date(sub.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(sub.id)}
                className="ml-4 shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
