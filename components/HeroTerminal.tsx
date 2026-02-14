"use client";

import { useEffect, useState } from "react";

const lines = [
  { text: "GET api.stripe.com → 200 OK", color: "text-green-400", delay: 400 },
  { text: "✓ status · operational", icon: "✓", label: "status", value: "operational", color: "text-green-400", delay: 600 },
  { text: "✓ response · 142ms", icon: "✓", label: "response", value: "142ms", color: "text-green-400", delay: 300 },
  { text: "✓ uptime · 99.98%", icon: "✓", label: "uptime", value: "99.98%", color: "text-green-400", delay: 300 },
  { text: "✓ ssl · valid (342 days)", icon: "✓", label: "ssl", value: "valid (342 days)", color: "text-green-400", delay: 300 },
  { text: "---", delay: 500 },
  { text: "POST /api/v1/heartbeat", color: "text-blue-400", delay: 400 },
  { text: "✓ database · 3ms", icon: "✓", label: "database", value: "3ms", color: "text-green-400", delay: 400 },
  { text: "✓ redis · 1ms", icon: "✓", label: "redis", value: "1ms", color: "text-green-400", delay: 300 },
  { text: "✗ sendgrid · timeout", icon: "✗", label: "sendgrid", value: "timeout", color: "text-red-400", delay: 500 },
  { text: "→ 200 received", color: "text-green-400", delay: 400 },
];

export default function HeroTerminal() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= lines.length) {
      // Restart after a pause
      const timeout = setTimeout(() => setVisibleCount(0), 3000);
      return () => clearTimeout(timeout);
    }

    const delay = visibleCount === 0 ? 600 : lines[visibleCount - 1]?.delay ?? 300;
    const timeout = setTimeout(() => setVisibleCount((c) => c + 1), delay);
    return () => clearTimeout(timeout);
  }, [visibleCount]);

  return (
    <div className="hidden lg:block">
      <div className="rounded-2xl bg-zinc-900 p-6 font-mono text-sm leading-relaxed text-zinc-300 shadow-2xl dark:bg-zinc-950">
        {/* Window chrome */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-zinc-500">
            bluemonitor — health check
          </span>
        </div>

        {/* Terminal content */}
        <div className="min-h-[260px]">
          {lines.map((line, i) => {
            if (i >= visibleCount) return null;

            // Separator
            if (line.text === "---") {
              return (
                <div
                  key={i}
                  className="my-3 border-t border-zinc-800"
                />
              );
            }

            // Command line (GET / POST / →)
            if (!line.icon) {
              return (
                <div
                  key={i}
                  className={`${line.color} ${i === 6 ? "mt-1" : i === 0 ? "" : "mt-2"} animate-fade-in`}
                >
                  {line.text}
                </div>
              );
            }

            // Check line
            const isError = line.color === "text-red-400";
            return (
              <div key={i} className="animate-fade-in text-zinc-500">
                <span className={line.color}>{line.icon}</span> {isError ? (
                  <>
                    <span className="text-red-400">{line.label}</span>{" "}
                    <span className="text-zinc-600">· {line.value}</span>
                  </>
                ) : (
                  <>
                    {line.label}{" "}
                    <span className="text-zinc-600">· {line.value}</span>
                  </>
                )}
              </div>
            );
          })}

          {/* Blinking cursor */}
          {visibleCount < lines.length && (
            <span className="mt-1 inline-block h-4 w-1.5 animate-pulse bg-zinc-500" />
          )}
        </div>
      </div>
    </div>
  );
}
