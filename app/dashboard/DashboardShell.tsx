"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardProvider } from "./DashboardContext";
import Sidebar from "./Sidebar";

interface DashboardShellProps {
  user: { id: string; name: string; email: string; image?: string | null };
  children: React.ReactNode;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/webhooks": "Webhooks",
  "/dashboard/settings": "Settings",
};

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] ?? (pathname.startsWith("/dashboard/services/") ? "Service Details" : "Dashboard");

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
      <div className="flex h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-zinc-200 bg-zinc-50/80 md:block dark:border-zinc-800 dark:bg-zinc-900/50">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={closeSidebar}
        />
        <aside
          className={`fixed left-0 top-0 z-50 h-screen w-64 bg-white shadow-2xl transition-transform duration-250 ease-out md:hidden dark:bg-zinc-900 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onNavigate={closeSidebar} />
        </aside>

        {/* Main content area */}
        <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950">
          {/* Mobile top bar */}
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 px-4 md:hidden dark:border-zinc-800">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            </Link>
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
