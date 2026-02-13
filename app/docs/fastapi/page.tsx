import { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "FastAPI Monitoring Setup — BlueMonitor",
  description:
    "Add uptime monitoring and heartbeat push to your FastAPI app. Health endpoint, APScheduler heartbeats, and status badge.",
  alternates: {
    canonical: "/docs/fastapi",
  },
};

export default function FastApiDocsPage() {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
        <Link
          href="/docs"
          className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Docs
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">FastAPI</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        FastAPI
      </h1>
      <p className="mt-4 text-zinc-500 dark:text-zinc-400">
        Add monitoring to your FastAPI app. Async health endpoint, APScheduler
        heartbeats, and status badge.
      </p>

      {/* Step 1 */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            1
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Health endpoint
          </h2>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`@app.get("/api/health")
async def health():
    return {"status": "ok"}`}</code>
        </pre>
      </section>

      {/* Step 2 */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            2
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Heartbeat push (optional)
          </h2>
        </div>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Use APScheduler to push heartbeats every 5 minutes. Install
          dependencies first:
        </p>
        <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-green-400 dark:bg-zinc-950">
          <code>{`pip install apscheduler httpx`}</code>
        </pre>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`import os
import time
import httpx
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager

BLUEMONITOR_API_KEY = os.getenv("BLUEMONITOR_API_KEY")

async def send_heartbeat():
    checks = {}

    # Database check
    db_start = time.monotonic()
    try:
        await database.execute("SELECT 1")
        checks["database"] = {
            "status": "ok",
            "latency": round((time.monotonic() - db_start) * 1000),
        }
    except Exception as e:
        checks["database"] = {
            "status": "error",
            "latency": round((time.monotonic() - db_start) * 1000),
            "message": str(e),
        }

    has_error = any(c["status"] == "error" for c in checks.values())

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://www.bluemonitor.org/api/v1/heartbeat",
            headers={"Authorization": f"Bearer {BLUEMONITOR_API_KEY}"},
            json={
                "domain": "yourapp.com",
                "status": "error" if has_error else "ok",
                "timestamp": datetime.utcnow().isoformat(),
                "checks": checks,
            },
        )

@asynccontextmanager
async def lifespan(app):
    scheduler = AsyncIOScheduler()
    scheduler.add_job(send_heartbeat, "interval", minutes=5)
    scheduler.start()
    await send_heartbeat()  # Send on startup
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)`}</code>
        </pre>
      </section>

      {/* Step 3 */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            3
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Status badge
          </h2>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-green-400 dark:bg-zinc-950">
          <code>{`[![Status](https://www.bluemonitor.org/api/badge/your-domain-com)](https://www.bluemonitor.org/status/your-domain-com)`}</code>
        </pre>
      </section>

      {/* AI tool CTA */}
      <section className="mt-12">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <h2 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
            Using an AI coding tool?
          </h2>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Paste this URL in Claude, Cursor, or Copilot and it will set up
            monitoring for your FastAPI app automatically.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 truncate rounded-lg bg-white px-4 py-2.5 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              https://www.bluemonitor.org/llm-fastapi.txt
            </code>
            <CopyButton text="https://www.bluemonitor.org/llm-fastapi.txt" />
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="mt-12">
        <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50">
          <h2 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
            Next steps
          </h2>
          <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li>
              <Link
                href="/docs/api"
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
              >
                API Reference
              </Link>{" "}
              — explore all endpoints
            </li>
            <li>
              <Link
                href="/badge"
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
              >
                Badge Generator
              </Link>{" "}
              — customize your badge
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
