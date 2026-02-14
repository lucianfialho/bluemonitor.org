"use client";

import { useState } from "react";
import Link from "next/link";
import CheckoutButton from "./CheckoutButton";

const FREE_FEATURES = [
  "3 services in watchlist",
  "2 webhook notifications",
  "Discord, Slack & custom webhooks",
  "15 API requests / min",
  "Status badge embeds",
  "Community support",
];

const PRO_FEATURES = [
  "Unlimited watchlist",
  "10 webhook notifications",
  "All alert events (down, slow, recovered, dead, resurrected)",
  "300 API requests / min",
  "1-minute recheck interval",
  "30-day history retention",
  "MCP integration for AI assistants",
  "Private monitoring for your services",
  "Priority support",
];

export default function PricingCards() {
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");

  const proPrice = period === "annual" ? "$7" : "$9";
  const proPeriod = "/mo";
  const proNote = period === "annual" ? "Billed annually ($84/year)" : null;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Billing toggle */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${
            period === "monthly"
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          Monthly
        </span>
        <button
          onClick={() => setPeriod(period === "monthly" ? "annual" : "monthly")}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            period === "annual"
              ? "bg-blue-600"
              : "bg-zinc-300 dark:bg-zinc-600"
          }`}
          role="switch"
          aria-checked={period === "annual"}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              period === "annual" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${
            period === "annual"
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          Annual
        </span>
        {period === "annual" && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
            Save 22%
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Free Plan */}
        <div className="relative flex flex-col rounded-2xl bg-zinc-100 p-6 sm:p-8 dark:bg-zinc-800/50">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Free
          </h2>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">$0</span>
          </div>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            For individuals keeping an eye on a few services.
          </p>

          <ul className="mt-6 flex-1 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-zinc-900 dark:text-zinc-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link
              href="/auth/sign-up"
              className="block w-full rounded-full bg-zinc-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="relative flex flex-col rounded-2xl bg-zinc-900 p-6 text-white shadow-xl sm:p-8 dark:bg-zinc-100 dark:text-zinc-900">
          <h2 className="text-lg font-semibold">Pro</h2>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-bold">{proPrice}</span>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              {proPeriod}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
            For teams and power users who need more.
          </p>
          {proNote && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {proNote}
            </p>
          )}

          <ul className="mt-6 flex-1 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-zinc-300 dark:text-zinc-600"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-white dark:text-zinc-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <CheckoutButton period={period} />
          </div>
        </div>
      </div>
    </div>
  );
}
