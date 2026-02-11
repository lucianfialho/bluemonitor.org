"use client";

import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import { StatusCheckResult } from "@/lib/types";

export default function StatusChecker({ domain }: { domain: string }) {
  const [result, setResult] = useState<StatusCheckResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      setLoading(true);
      try {
        const res = await fetch(`/api/check/${encodeURIComponent(domain)}`);
        if (res.ok) {
          const data = await res.json();
          setResult(data);
        }
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [domain]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3">
        <StatusBadge status="checking" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Checking status...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-3">
        <StatusBadge status="unknown" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Unable to determine status
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <StatusBadge status={result.status} />
      <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          Response time: <strong className="text-zinc-900 dark:text-zinc-100">{result.responseTime}ms</strong>
        </span>
        <span>
          HTTP {result.statusCode}
        </span>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Last checked: {new Date(result.checkedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
