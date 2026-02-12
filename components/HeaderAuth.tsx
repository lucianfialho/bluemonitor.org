"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@neondatabase/auth/react";

export default function HeaderAuth() {
  return (
    <>
      <SignedIn>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Dashboard
        </Link>
        <UserButton size="icon" />
      </SignedIn>
      <SignedOut>
        <Link
          href="/auth/sign-in"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Sign in
        </Link>
      </SignedOut>
    </>
  );
}
