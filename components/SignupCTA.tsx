"use client";

import Link from "next/link";
import { SignedOut } from "@neondatabase/auth/react";

export default function SignupCTA() {
  return (
    <SignedOut>
      <div className="mb-10 rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/80 to-white p-6 text-center dark:border-blue-900/60 dark:from-blue-950/30 dark:to-zinc-900 sm:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Don&apos;t let downtime kill your vibe.
        </h2>
        <p className="mx-auto mb-5 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Real-time alerts, uptime history, and bot tracking.
          Set up monitoring for your app in under 2 minutes.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Get started free
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/developers"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            View docs
          </Link>
        </div>
      </div>
    </SignedOut>
  );
}
