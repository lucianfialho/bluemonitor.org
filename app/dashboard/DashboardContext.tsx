"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface PlanInfo {
  tier: "free" | "pro";
  limits: {
    maxWatchlist: number;
    maxWebhooks: number;
    allowedWebhookEvents: string[];
    rateLimitAuthenticated: number;
    historyRetentionDays: number;
    recheckIntervalMinutes: number;
    mcpAccess: boolean;
  };
  status: string;
  billingPeriod: string | null;
  currentPeriodEnd: string | null;
}

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface DashboardContextValue {
  user: DashboardUser;
  plan: PlanInfo | null;
  planLoading: boolean;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    const res = await fetch("/api/user/plan");
    const data = await res.json();
    setPlan(data);
    setPlanLoading(false);
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return (
    <DashboardContext.Provider value={{ user, plan, planLoading }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
