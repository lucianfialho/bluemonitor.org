"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@neondatabase/auth/react";

export default function CheckoutButton({ period }: { period: "monthly" | "annual" }) {
  return (
    <>
      <SignedIn>
        <CheckoutAction period={period} />
      </SignedIn>
      <SignedOut>
        <Link
          href="/auth/sign-up"
          className="block w-full rounded-full bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Sign up to upgrade
        </Link>
      </SignedOut>
    </>
  );
}

function CheckoutAction({ period }: { period: "monthly" | "annual" }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      {loading ? "Redirecting..." : "Upgrade to Pro"}
    </button>
  );
}
