"use client";

import { useEffect, useState } from "react";

// ---- Types ----

interface Submission {
  id: number;
  name: string;
  url: string;
  status: string;
  created_at: string;
}

interface ProUser {
  user_id: string;
  email: string;
  name: string | null;
  plan: string;
  status: string;
  billing_period: string | null;
  current_period_end: string | null;
  created_at: string;
}

type Tab = "submissions" | "users";
type Filter = "all" | "pending" | "approved" | "rejected";

// ---- Constants ----

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

// ---- Main Component ----

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("submissions");

  return (
    <div>
      {/* Tab navigation */}
      <div className="mb-6 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {(["submissions", "users"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {t === "submissions" ? "Submissions" : "Users & Plans"}
          </button>
        ))}
      </div>

      {tab === "submissions" ? <SubmissionsTab /> : <UsersTab />}
    </div>
  );
}

// ---- Submissions Tab ----

function SubmissionsTab() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [promotingId, setPromotingId] = useState<number | null>(null);

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

  async function handleApprove(id: number, category: string) {
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
      <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        Submissions
      </h2>

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
                    <div className="relative">
                      <button
                        onClick={() => setPromotingId(promotingId === sub.id ? null : sub.id)}
                        className="rounded-lg border border-green-200 px-3 py-1.5 text-sm text-green-600 transition-colors hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
                      >
                        Approve
                      </button>
                      {promotingId === sub.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                          <p className="px-3 py-1.5 text-xs font-medium text-zinc-500">
                            Select category:
                          </p>
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.slug}
                              onClick={() => handleApprove(sub.id, cat.slug)}
                              className="block w-full px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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

// ---- Users Tab ----

function UsersTab() {
  const [proUsers, setProUsers] = useState<ProUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantEmail, setGrantEmail] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchProUsers();
  }, []);

  async function fetchProUsers() {
    const res = await fetch("/api/admin/grant-pro");
    if (res.ok) {
      const data = await res.json();
      setProUsers(data.users);
    }
    setLoading(false);
  }

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!grantEmail.trim()) return;

    setActionLoading("grant");
    setMessage(null);

    const res = await fetch("/api/admin/grant-pro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: grantEmail.trim() }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage({ type: "success", text: `Pro granted to ${data.user.email}` });
      setGrantEmail("");
      fetchProUsers();
    } else {
      setMessage({ type: "error", text: data.error || "Failed to grant Pro" });
    }

    setActionLoading(null);
  }

  async function handleReGrant(email: string) {
    setActionLoading(email);
    setMessage(null);

    const res = await fetch("/api/admin/grant-pro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage({ type: "success", text: `Pro re-granted to ${email}` });
      fetchProUsers();
    } else {
      setMessage({ type: "error", text: data.error || "Failed to grant Pro" });
    }

    setActionLoading(null);
  }

  async function handleRevoke(email: string) {
    setActionLoading(email);
    setMessage(null);

    const res = await fetch("/api/admin/grant-pro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, action: "revoke" }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage({ type: "success", text: `Pro revoked from ${email}` });
      fetchProUsers();
    } else {
      setMessage({ type: "error", text: data.error || "Failed to revoke Pro" });
    }

    setActionLoading(null);
  }

  function getPlanBadge(user: ProUser) {
    if (user.plan === "pro" && user.status === "active") {
      if (user.billing_period === "beta") {
        return (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            Pro (Beta)
          </span>
        );
      }
      return (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
          Pro ({user.billing_period || "stripe"})
        </span>
      );
    }
    return (
      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        {user.plan} / {user.status}
      </span>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        Users & Plans
      </h2>

      {/* Grant Pro form */}
      <form onSubmit={handleGrant} className="mb-6 flex gap-2">
        <input
          type="email"
          value={grantEmail}
          onChange={(e) => setGrantEmail(e.target.value)}
          placeholder="user@email.com"
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={actionLoading === "grant" || !grantEmail.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {actionLoading === "grant" ? "Granting..." : "Grant Pro"}
        </button>
      </form>

      {/* Feedback message */}
      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Pro users list */}
      {loading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : proUsers.length === 0 ? (
        <p className="text-zinc-500">No users with plans yet.</p>
      ) : (
        <div className="space-y-3">
          {proUsers.map((user) => (
            <div
              key={user.user_id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {user.name || "No name"}
                    </p>
                    {getPlanBadge(user)}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {user.email}
                  </p>
                  <div className="mt-1 flex gap-3 text-xs text-zinc-400">
                    <span>Since {new Date(user.created_at).toLocaleDateString()}</span>
                    {user.current_period_end && (
                      <span>Expires {new Date(user.current_period_end).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {user.plan === "pro" && user.status === "active" ? (
                    <button
                      onClick={() => handleRevoke(user.email)}
                      disabled={actionLoading === user.email}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      {actionLoading === user.email ? "Revoking..." : "Revoke"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReGrant(user.email)}
                      disabled={actionLoading === user.email}
                      className="rounded-lg border border-green-200 px-3 py-1.5 text-sm text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
                    >
                      {actionLoading === user.email ? "Granting..." : "Re-grant"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
