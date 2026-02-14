"use client";

import { useState } from "react";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 404) {
        alert("You're on the beta plan — no subscription to manage.");
      }
    } catch {
      // network error
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="shrink-0 rounded-lg border border-zinc-300 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    >
      {loading ? "Loading..." : "Manage Subscription"}
    </button>
  );
}
