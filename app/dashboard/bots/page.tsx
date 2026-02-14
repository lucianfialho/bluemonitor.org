"use client";

import { useCallback, useEffect, useState } from "react";
import BotTrackingSection from "../BotTrackingSection";
import { useDashboard } from "../DashboardContext";

interface WatchlistService {
  id: number;
  domain: string;
  last_heartbeat_at: string | null;
}

export default function BotsPage() {
  const { plan } = useDashboard();
  const [domains, setDomains] = useState<string[]>([]);

  const fetchDomains = useCallback(async () => {
    const res = await fetch("/api/watchlist");
    const data = await res.json();
    const services: WatchlistService[] = data.services || [];
    setDomains([...new Set(services.filter((s) => s.last_heartbeat_at).map((s) => s.domain))]);
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Bot Tracking
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Monitor bot visits across your domains.
        </p>
      </div>

      <BotTrackingSection isPro={plan?.tier === "pro"} domains={domains} />
    </div>
  );
}
