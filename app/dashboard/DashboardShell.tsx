"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardProvider } from "./DashboardContext";
import Sidebar from "./Sidebar";

interface DashboardShellProps {
  user: { id: string; name: string; email: string; image?: string | null };
  children: React.ReactNode;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/bots": "Bot Tracking",
  "/dashboard/webhooks": "Webhooks",
  "/dashboard/settings": "Settings",
};

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] ?? "Dashboard";

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [sidebarOpen]);

  return (
    <DashboardProvider user={user}>
      {/* Fills viewport below sticky Header (h-16 + 1px border = 65px) */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Desktop sidebar — no border, background separation */}
        <aside className="hidden w-56 shrink-0 bg-zinc-50/80 md:block dark:bg-zinc-900/50">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        <div
          className={`fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={closeSidebar}
        />
        <aside
          className={`fixed left-0 top-16 z-50 h-[calc(100vh-65px)] w-64 bg-white shadow-2xl transition-transform duration-250 ease-out md:hidden dark:bg-zinc-900 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onNavigate={closeSidebar} />
        </aside>

        {/* Main content area */}
        <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950">
          {/* Mobile header bar */}
          <div className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-100 px-4 md:hidden dark:border-zinc-800/50">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
              {pageTitle}
            </span>
          </div>

          {/* Scrollable page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
