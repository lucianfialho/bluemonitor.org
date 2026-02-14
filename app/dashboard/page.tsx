"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ServiceIcon from "@/components/ServiceIcon";
import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";
import { Category } from "@/lib/types";
import SetupGuide from "./SetupGuide";
import { useDashboard } from "./DashboardContext";

interface ApiKey {
  id: number;
  name: string;
  key_preview: string;
  created_at: string;
  last_used_at: string | null;
}

interface WatchlistService {
  id: number;
  slug: string;
  name: string;
  domain: string;
  category: Category;
  current_status: "up" | "down" | "slow" | "dead" | null;
  current_response_time: number | null;
  last_checked_at: string | null;
  last_heartbeat_at: string | null;
  is_private: boolean;
  added_at: string;
  uptime_24h: number | null;
}

function getUptimeColor(uptime: number): string {
  if (uptime >= 99) return "text-green-600 dark:text-green-400";
  if (uptime >= 95) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

export default function OverviewPage() {
  const searchParams = useSearchParams();
  const { user, plan } = useDashboard();

  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(
    searchParams.get("upgraded") === "true"
  );

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistService[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [webhookCount, setWebhookCount] = useState(0);

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/keys");
    const data = await res.json();
    setKeys(data.keys || []);
  }, []);

  const fetchWatchlist = useCallback(async () => {
    const res = await fetch("/api/watchlist");
    const data = await res.json();
    setWatchlist(data.services || []);
    setWatchlistLoading(false);
  }, []);

  const fetchWebhookCount = useCallback(async () => {
    const res = await fetch("/api/webhooks");
    const data = await res.json();
    setWebhookCount((data.webhooks || []).length);
  }, []);

  useEffect(() => {
    fetchKeys();
    fetchWatchlist();
    fetchWebhookCount();
  }, [fetchKeys, fetchWatchlist, fetchWebhookCount]);

  async function removeFromWatchlist(serviceId: number) {
    setWatchlist((prev) => prev.filter((s) => s.id !== serviceId));
    await fetch(`/api/watchlist/${serviceId}`, { method: "DELETE" });
  }

  async function togglePrivate(serviceId: number, isPrivate: boolean) {
    setWatchlist((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, is_private: isPrivate } : s))
    );
    const res = await fetch(`/api/watchlist/${serviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_private: isPrivate }),
    });
    if (!res.ok) {
      setWatchlist((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, is_private: !isPrivate } : s))
      );
      if (res.status === 403) {
        window.location.href = "/pricing";
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Overview
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Welcome, {user.name || user.email}.
        </p>
      </div>

      {/* Upgrade success banner */}
      {showUpgradeSuccess && (
        <div className="mb-4 flex animate-[fadeSlideIn_0.3s_ease-out] items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900 dark:bg-green-950/40">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Welcome to Pro! Your limits have been upgraded.
          </p>
          <button
            onClick={() => setShowUpgradeSuccess(false)}
            className="text-green-600 transition-transform hover:text-green-800 active:scale-90 dark:text-green-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Plan banner */}
      {plan?.tier === "pro" ? (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 px-5 py-4 dark:border-purple-900 dark:bg-purple-950/40">
          <div>
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
              <span className="mr-1.5 inline-block rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-bold text-white">PRO</span>
              Unlimited watchlist, {plan.limits.maxWebhooks} webhooks, {plan.limits.rateLimitAuthenticated} API req/min
            </p>
            {plan.status === "canceling" && plan.currentPeriodEnd && (
              <p className="mt-0.5 text-xs text-purple-700 dark:text-purple-300">
                Cancels on {new Date(plan.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <ManageSubscriptionButton />
        </div>
      ) : plan ? (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-900 dark:bg-blue-950/40">
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Free plan — {plan.limits.maxWatchlist} watchlist services, {plan.limits.maxWebhooks} webhooks, 15 API req/min
            </p>
            <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
              Need more? Upgrade to Pro for unlimited watchlist and priority alerts.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-700 active:scale-95"
          >
            Upgrade
          </Link>
        </div>
      ) : null}

      {/* Setup Guide */}
      <SetupGuide
        hasApiKey={keys.length > 0}
        apiKeyPreview={keys[0]?.key_preview ?? null}
        hasHeartbeatService={watchlist.some((s) => s.last_heartbeat_at !== null)}
        hasWebhook={webhookCount > 0}
        onHeartbeatReceived={fetchWatchlist}
      />

      {/* Quick stats */}
      {!watchlistLoading && watchlist.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[11px] font-medium uppercase tracking-wider text-blue-500 dark:text-blue-400">
              Services
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {watchlist.length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[11px] font-medium uppercase tracking-wider text-blue-500 dark:text-blue-400">
              Uptime (24h)
            </p>
            <p className={`mt-1 text-2xl font-bold ${(() => {
              const vals = watchlist
                .map((s) => s.uptime_24h)
                .filter((v): v is number => v !== null);
              if (vals.length === 0) return "text-zinc-400";
              const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
              return getUptimeColor(avg);
            })()}`}>
              {(() => {
                const vals = watchlist
                  .map((s) => s.uptime_24h)
                  .filter((v): v is number => v !== null);
                if (vals.length === 0) return "\u2014";
                return (Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10) + "%";
              })()}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[11px] font-medium uppercase tracking-wider text-blue-500 dark:text-blue-400">
              Avg Response
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {(() => {
                const times = watchlist
                  .map((s) => s.current_response_time)
                  .filter((t): t is number => t !== null);
                if (times.length === 0) return "\u2014";
                return Math.round(times.reduce((a, b) => a + b, 0) / times.length) + "ms";
              })()}
            </p>
          </div>
        </div>
      )}

      {/* Watchlist */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Your Watchlist
          </h2>
          <Link
            href="/"
            className="text-sm text-blue-600 transition-colors hover:underline dark:text-blue-400"
          >
            Browse services
          </Link>
        </div>

        {watchlistLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-5 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            Loading...
          </div>
        ) : watchlist.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Your watchlist is empty. Add services from any service page to monitor them here.
            </p>
            <Link
              href="/"
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Discover services
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {watchlist.map((service) => (
              <div
                key={service.id}
                className="group relative flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-150 hover:border-blue-300 hover:shadow-md active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
              >
                <Link
                  href={`/dashboard/services/${encodeURIComponent(service.domain)}`}
                  className="absolute inset-0 z-0"
                  aria-label={service.name}
                />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <ServiceIcon domain={service.domain} name={service.name} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                      {service.name}
                    </span>
                    {service.current_status && (
                      <span
                        className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                          service.current_status === "up"
                            ? "bg-green-500"
                            : service.current_status === "slow"
                              ? "bg-yellow-500"
                              : service.current_status === "dead"
                                ? "bg-zinc-500"
                                : "bg-red-500"
                        }`}
                        title={
                          service.current_status === "up"
                            ? "Operational"
                            : service.current_status === "slow"
                              ? "Slow"
                              : service.current_status === "dead"
                                ? "Unresponsive"
                                : "Down"
                        }
                      />
                    )}
                    {service.uptime_24h !== null && (
                      <span className={`text-[11px] font-semibold ${getUptimeColor(service.uptime_24h)}`}>
                        {service.uptime_24h}%
                      </span>
                    )}
                    {service.last_heartbeat_at && (
                      <span className="rounded bg-purple-100 px-1 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                        HEARTBEAT
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-zinc-500">{service.domain}</p>
                  {service.last_heartbeat_at && (
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                      {service.current_response_time !== null && (
                        <span>{service.current_response_time}ms</span>
                      )}
                      <span>
                        Last heartbeat{" "}
                        {(() => {
                          const diff = Date.now() - new Date(service.last_heartbeat_at).getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 1) return "just now";
                          if (mins < 60) return `${mins}m ago`;
                          const hours = Math.floor(mins / 60);
                          if (hours < 24) return `${hours}h ago`;
                          return `${Math.floor(hours / 24)}d ago`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative z-10 flex items-center gap-1">
                  {service.last_heartbeat_at && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePrivate(service.id, !service.is_private);
                      }}
                      className={`rounded-md p-1 transition-all duration-150 active:scale-90 ${
                        service.is_private
                          ? "text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950"
                          : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                      title={service.is_private ? "Private (click to make public)" : "Public (click to make private)"}
                    >
                      {service.is_private ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      )}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWatchlist(service.id);
                    }}
                    className="rounded-md p-1 text-zinc-400 transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-90 dark:hover:bg-red-950 dark:hover:text-red-400"
                    title="Remove from watchlist"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add a Host guide */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Add a Host
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Option 1: Browse services */}
          <Link
            href="/"
            className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-150 hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
              Browse &amp; add a service
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Pick from hundreds of popular services. We ping them automatically and track their status for you.
            </p>
          </Link>

          {/* Option 2: Push heartbeat */}
          <Link
            href="/developers"
            className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-150 hover:border-purple-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-purple-700"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-purple-600 dark:text-zinc-100 dark:group-hover:text-purple-400">
              Monitor your own app
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Add a few lines of code to send heartbeats from your app. Track uptime, response times, and bot visits.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
