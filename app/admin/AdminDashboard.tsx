"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Submission {
  id: number;
  name: string;
  url: string;
  status: string;
  created_at: string;
}

type Filter = "all" | "pending" | "approved" | "rejected";

const CATEGORIES = [
  { slug: "ai", name: "AI Services" },
  { slug: "social-media", name: "Social Media" },
  { slug: "gaming", name: "Gaming" },
  { slug: "streaming", name: "Streaming" },
  { slug: "productivity", name: "Productivity" },
  { slug: "cloud", name: "Cloud Services" },
  { slug: "finance", name: "Finance" },
  { slug: "communication", name: "Communication" },
  { slug: "ecommerce", name: "E-Commerce" },
  { slug: "developer", name: "Developer Tools" },
  { slug: "education", name: "Education" },
  { slug: "delivery", name: "Delivery" },
  { slug: "vpn", name: "VPN & Security" },
  { slug: "entertainment", name: "Entertainment" },
  { slug: "isp", name: "Internet Providers" },
  { slug: "dating", name: "Dating" },
  { slug: "logistics", name: "Logistics & Shipping" },
  { slug: "travel", name: "Travel" },
];

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [promotingId, setPromotingId] = useState<number | null>(null);
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

  async function handleStatusChange(id: number, status: string) {
    await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  }

  async function handlePromote(id: number, category: string) {
    const res = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "approved", promote: true, category }),
    });
    if (res.ok) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "approved" } : s))
      );
    }
    setPromotingId(null);
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

  const filtered = filter === "all"
    ? submissions
    : submissions.filter((s) => s.status === filter);

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Submissions
        </h1>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-blue-600 text-white"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-zinc-500">No submissions.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {sub.name}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        sub.status === "approved"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : sub.status === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
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
                <div className="flex shrink-0 gap-2">
                  {sub.status !== "approved" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(sub.id, "approved")}
                        className="rounded-lg border border-green-200 px-3 py-1.5 text-sm text-green-600 transition-colors hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
                      >
                        Approve
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setPromotingId(promotingId === sub.id ? null : sub.id)}
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                        >
                          Add to Site
                        </button>
                        {promotingId === sub.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                            <p className="px-3 py-1.5 text-xs font-medium text-zinc-500">
                              Select category:
                            </p>
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat.slug}
                                onClick={() => handlePromote(sub.id, cat.slug)}
                                className="block w-full px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {sub.status !== "rejected" && (
                    <button
                      onClick={() => handleStatusChange(sub.id, "rejected")}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
