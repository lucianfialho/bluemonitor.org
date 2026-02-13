"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const frameworks = [
  { slug: "nextjs", name: "Next.js" },
  { slug: "express", name: "Express" },
  { slug: "hono", name: "Hono" },
  { slug: "fastapi", name: "FastAPI" },
  { slug: "rails", name: "Rails" },
  { slug: "laravel", name: "Laravel" },
];

const navItems = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/api", label: "API Reference" },
];

export default function DocsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href;
  }

  const sidebar = (
    <nav className="space-y-6">
      <div className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(item.href)
                ? "bg-zinc-200/70 font-semibold text-zinc-900 dark:bg-zinc-700/50 dark:text-zinc-100"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div>
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Framework Guides
        </h3>
        <div className="space-y-1">
          {frameworks.map((fw) => {
            const href = `/docs/${fw.slug}`;
            return (
              <Link
                key={fw.slug}
                href={href}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive(href)
                    ? "bg-zinc-200/70 font-semibold text-zinc-900 dark:bg-zinc-700/50 dark:text-zinc-100"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                }`}
              >
                {fw.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg lg:hidden dark:bg-zinc-100 dark:text-zinc-900"
        aria-label="Toggle docs navigation"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          {open ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl transition-transform lg:hidden dark:bg-zinc-900 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {sidebar}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 w-56">{sidebar}</div>
      </aside>
    </>
  );
}
