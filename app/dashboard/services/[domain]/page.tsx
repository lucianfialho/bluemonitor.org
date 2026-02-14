"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ServiceIcon from "@/components/ServiceIcon";
import StatusTimeline from "@/components/StatusTimeline";
import HeartbeatChecks from "@/components/HeartbeatChecks";
import BotTrackingSection from "../../BotTrackingSection";
import { useDashboard } from "../../DashboardContext";
import { Category } from "@/lib/types";

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

function StatusLabel({ status }: { status: WatchlistService["current_status"] }) {
  if (!status) return <span className="text-xs text-zinc-400">Unknown</span>;
  const map = {
    up: { label: "Operational", color: "bg-green-500", text: "text-green-700 dark:text-green-400" },
    down: { label: "Down", color: "bg-red-500", text: "text-red-700 dark:text-red-400" },
    slow: { label: "Slow", color: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400" },
    dead: { label: "Unresponsive", color: "bg-zinc-500", text: "text-zinc-600 dark:text-zinc-400" },
  } as const;
  const s = map[status];
  return (
    <span className={`flex items-center gap-1.5 text-sm font-semibold ${s.text}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${s.color}`} />
      {s.label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ServiceDetailPage() {
  const params = useParams<{ domain: string }>();
  const domain = decodeURIComponent(params.domain);
  const { plan } = useDashboard();

  const [service, setService] = useState<WatchlistService | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchService = useCallback(async () => {
    const res = await fetch("/api/watchlist");
    const data = await res.json();
    const services: WatchlistService[] = data.services || [];
    const match = services.find((s) => s.domain === domain);
    if (match) {
      setService(match);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }, [domain]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="text-sm text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </Link>
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Service not found in your watchlist.</p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="mb-5 inline-flex items-center gap-1 text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Service hero card */}
      <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/80 to-white p-6 dark:border-blue-900/60 dark:from-blue-950/30 dark:to-zinc-900">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-zinc-800">
            <ServiceIcon domain={service.domain} name={service.name} size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {service.name}
              </h1>
              {service.last_heartbeat_at && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  Heartbeat
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{service.domain}</p>
          </div>
          <Link
            href={`/status/${service.slug}`}
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 sm:inline-flex dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-950"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Public page
          </Link>
        </div>

        {/* Stats row inside hero */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white/80 p-3 dark:bg-zinc-800/60">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-blue-500 dark:text-blue-400">Status</p>
            <StatusLabel status={service.current_status} />
          </div>
          <div className="rounded-xl bg-white/80 p-3 dark:bg-zinc-800/60">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-blue-500 dark:text-blue-400">Response Time</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {service.current_response_time !== null ? `${service.current_response_time}ms` : "\u2014"}
            </p>
          </div>
          <div className="rounded-xl bg-white/80 p-3 dark:bg-zinc-800/60">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-blue-500 dark:text-blue-400">Last Heartbeat</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {service.last_heartbeat_at ? timeAgo(service.last_heartbeat_at) : "\u2014"}
            </p>
          </div>
          <div className="rounded-xl bg-white/80 p-3 dark:bg-zinc-800/60">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-blue-500 dark:text-blue-400">Uptime (24h)</p>
            <p className={`text-sm font-semibold ${service.uptime_24h !== null ? getUptimeColor(service.uptime_24h) : "text-zinc-900 dark:text-zinc-100"}`}>
              {service.uptime_24h !== null ? `${service.uptime_24h}%` : "\u2014"}
            </p>
          </div>
        </div>

        {/* Mobile-only public page link */}
        <div className="mt-4 sm:hidden">
          <Link
            href={`/status/${service.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            View public status page
          </Link>
        </div>
      </div>

      {/* Status Timeline — 24h overview */}
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <StatusTimeline slug={service.slug} />
      </div>

      {/* Health Checks — latency charts per check */}
      {service.last_heartbeat_at && (
        <div className="mb-6">
          <HeartbeatChecks slug={service.slug} currentChecks={null} />
        </div>
      )}

      {/* Bot Tracking */}
      <BotTrackingSection isPro={plan?.tier === "pro"} domains={[service.domain]} />
    </div>
  );
}
