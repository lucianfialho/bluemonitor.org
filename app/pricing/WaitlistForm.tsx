"use client";

import { useState } from "react";
import { trackWaitlistJoin } from "@/lib/analytics";
import { SignedIn, SignedOut } from "@neondatabase/auth/react";

export default function WaitlistForm() {
  return (
    <>
      <SignedIn>
        <WaitlistButton />
      </SignedIn>
      <SignedOut>
        <WaitlistEmailForm />
      </SignedOut>
    </>
  );
}

function WaitlistButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function handleClick() {
    setStatus("loading");
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      trackWaitlistJoin();
      setStatus("done");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-lg bg-green-50 px-4 py-2.5 text-center text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
        You&apos;re on the list!
      </p>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
    >
      {status === "loading" ? "Joining..." : "Join Waitlist"}
    </button>
  );
}

function WaitlistEmailForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        trackWaitlistJoin();
        setStatus("done");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-lg bg-green-50 px-4 py-2.5 text-center text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
        You&apos;re on the list!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@email.com"
        className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "loading" ? "Joining..." : "Join Waitlist"}
      </button>
    </form>
  );
}
