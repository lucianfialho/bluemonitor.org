"use client";

import { useCallback, useEffect, useState } from "react";

interface SetupGuideProps {
  hasApiKey: boolean;
  apiKeyPreview: string | null;
  hasHeartbeatService: boolean;
  hasWebhook: boolean;
  onHeartbeatReceived: () => void;
}

export default function SetupGuide({
  hasApiKey,
  apiKeyPreview,
  hasHeartbeatService,
  hasWebhook,
  onHeartbeatReceived,
}: SetupGuideProps) {
  const [polling, setPolling] = useState(!hasHeartbeatService);
  const [dismissed, setDismissed] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const allDone = hasApiKey && hasHeartbeatService;

  const pollHeartbeat = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      const services = data.services || [];
      if (services.some((s: { last_heartbeat_at: string | null }) => s.last_heartbeat_at)) {
        setPolling(false);
        onHeartbeatReceived();
      }
    } catch {
      // ignore
    }
  }, [onHeartbeatReceived]);

  useEffect(() => {
    if (!polling || hasHeartbeatService) return;
    const interval = setInterval(pollHeartbeat, 5000);
    return () => clearInterval(interval);
  }, [polling, hasHeartbeatService, pollHeartbeat]);

  if (dismissed || (allDone && hasWebhook)) return null;

  const steps = [
    {
      key: "api-key",
      label: "Create an API key",
      description: "Generate a key below to authenticate heartbeat requests.",
      done: hasApiKey,
    },
    {
      key: "heartbeat",
      label: "Send your first heartbeat",
      description: hasApiKey
        ? "Add the code snippet to your app and deploy it."
        : "Create an API key first, then copy the code snippet.",
      done: hasHeartbeatService,
    },
    {
      key: "webhook",
      label: "Set up alerts (optional)",
      description: "Add a Discord or Slack webhook to get notified when your service goes down.",
      done: hasWebhook,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  const snippet = `await fetch("https://www.bluemonitor.org/api/v1/heartbeat", {
  method: "POST",
  headers: {
    Authorization: "Bearer ${apiKeyPreview ? apiKeyPreview + "..." : "bm_your_api_key"}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    domain: "yourapp.com",
    status: "ok",
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: "ok", latency: 5 },
    },
  }),
});`;

  return (
    <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Setup Guide
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {completedCount}/{steps.length} steps completed
          </p>
        </div>
        {allDone && (
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.done
                    ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                }`}
              >
                {step.done ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`mt-1 h-full w-px ${step.done ? "bg-green-200 dark:bg-green-800" : "bg-zinc-200 dark:bg-zinc-700"}`} />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-3">
              <p
                className={`text-sm font-medium ${
                  step.done
                    ? "text-green-600 dark:text-green-400"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {step.label}
                {step.key === "heartbeat" && !step.done && hasApiKey && polling && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-amber-600 dark:text-amber-400">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                    Waiting for heartbeat...
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {step.description}
              </p>

              {/* Heartbeat code snippet */}
              {step.key === "heartbeat" && !step.done && hasApiKey && (
                <div className="relative mt-3">
                  <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-300">
                    <code>{snippet}</code>
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(snippet);
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 2000);
                    }}
                    className="absolute right-2 top-2 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  >
                    {copiedSnippet ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
