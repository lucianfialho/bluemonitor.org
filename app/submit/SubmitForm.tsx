"use client";

import { useState } from "react";

export default function SubmitForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          url: data.get("url"),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Something went wrong");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
        <div className="mb-2 text-lg font-semibold text-green-800 dark:text-green-200">
          Thanks for your submission!
        </div>
        <p className="mb-4 text-sm text-green-700 dark:text-green-300">
          We&apos;ll review it and add the service to our monitoring list.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm font-medium text-green-700 underline hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
        >
          Submit another service
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Service Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="e.g. Notion, Figma, Stripe"
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div>
        <label htmlFor="url" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Website URL
        </label>
        <input
          type="url"
          id="url"
          name="url"
          required
          placeholder="https://example.com"
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "loading" ? "Submitting..." : "Submit Service"}
      </button>
    </form>
  );
}
