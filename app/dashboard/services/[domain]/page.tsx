"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ServiceIcon from "@/components/ServiceIcon";
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
    <span className={`flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
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
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </Link>
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Service not found in your watchlist.</p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
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
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Service header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <ServiceIcon domain={service.domain} name={service.name} size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {service.name}
            </h1>
            {service.last_heartbeat_at && (
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                HEARTBEAT
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500">{service.domain}</p>
        </div>
      </div>

      {/* Service stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 text-[11px] font-medium text-zinc-400">Status</p>
          <StatusLabel status={service.current_status} />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 text-[11px] font-medium text-zinc-400">Response Time</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {service.current_response_time !== null ? `${service.current_response_time}ms` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 text-[11px] font-medium text-zinc-400">Last Heartbeat</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {service.last_heartbeat_at ? timeAgo(service.last_heartbeat_at) : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 text-[11px] font-medium text-zinc-400">Last Checked</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {service.last_checked_at ? timeAgo(service.last_checked_at) : "—"}
          </p>
        </div>
      </div>

      {/* Bot Tracking */}
      <BotTrackingSection isPro={plan?.tier === "pro"} domains={[service.domain]} />

      {/* Link to public status page */}
      <div className="mt-2">
        <Link
          href={`/status/${service.slug}`}
          className="text-sm text-blue-600 transition-colors hover:underline dark:text-blue-400"
        >
          View public status page
        </Link>
      </div>
    </div>
  );
}
