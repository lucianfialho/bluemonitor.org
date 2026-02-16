import { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "FastAPI Monitoring Setup",
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

      {/* Step 4: Bot tracking */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            4
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Bot tracking
            </h2>
            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
              PRO
            </span>
          </div>
        </div>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Track which search engines, AI crawlers, and social bots visit your
          app. Add bot detection middleware to report visits to BlueMonitor.
          Requires a{" "}
          <Link
            href="/pricing"
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
          >
            Pro plan
          </Link>
          .
        </p>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          FastAPI middleware
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`import re, os, httpx
from starlette.middleware.base import BaseHTTPMiddleware

BOT_PATTERNS = [
    # Search engines
    (re.compile(r"Googlebot", re.I), "googlebot", "search_engine"),
    (re.compile(r"bingbot", re.I), "bingbot", "search_engine"),
    (re.compile(r"YandexBot", re.I), "yandexbot", "search_engine"),
    (re.compile(r"Baiduspider", re.I), "baiduspider", "search_engine"),
    (re.compile(r"DuckDuckBot", re.I), "duckduckbot", "search_engine"),
    (re.compile(r"Applebot", re.I), "applebot", "search_engine"),
    (re.compile(r"PetalBot", re.I), "petalbot", "search_engine"),
    (re.compile(r"Sogou", re.I), "sogoubot", "search_engine"),
    (re.compile(r"NaverBot", re.I), "naverbot", "search_engine"),
    (re.compile(r"Seznambot", re.I), "seznambot", "search_engine"),
    # AI crawlers
    (re.compile(r"GPTBot", re.I), "gptbot", "ai_crawler"),
    (re.compile(r"ChatGPT-User", re.I), "chatgpt-user", "ai_crawler"),
    (re.compile(r"OAI-SearchBot", re.I), "oai-searchbot", "ai_crawler"),
    (re.compile(r"ClaudeBot", re.I), "claudebot", "ai_crawler"),
    (re.compile(r"anthropic-ai", re.I), "anthropic-ai", "ai_crawler"),
    (re.compile(r"PerplexityBot", re.I), "perplexitybot", "ai_crawler"),
    (re.compile(r"Bytespider", re.I), "bytespider", "ai_crawler"),
    (re.compile(r"CCBot", re.I), "ccbot", "ai_crawler"),
    (re.compile(r"Meta-ExternalAgent", re.I), "meta-externalagent", "ai_crawler"),
    (re.compile(r"Google-Extended", re.I), "google-extended", "ai_crawler"),
    (re.compile(r"Amazonbot", re.I), "amazonbot", "ai_crawler"),
    (re.compile(r"cohere-ai", re.I), "cohere-ai", "ai_crawler"),
    (re.compile(r"DeepSeekBot", re.I), "deepseekbot", "ai_crawler"),
    (re.compile(r"YouBot", re.I), "youbot", "ai_crawler"),
    (re.compile(r"AI2Bot", re.I), "ai2bot", "ai_crawler"),
    (re.compile(r"Timpibot", re.I), "timpibot", "ai_crawler"),
    # Social
    (re.compile(r"Twitterbot", re.I), "twitterbot", "social"),
    (re.compile(r"facebookexternalhit", re.I), "facebookbot", "social"),
    (re.compile(r"LinkedInBot", re.I), "linkedinbot", "social"),
    (re.compile(r"Slackbot", re.I), "slackbot", "social"),
    (re.compile(r"Discordbot", re.I), "discordbot", "social"),
    (re.compile(r"TelegramBot", re.I), "telegrambot", "social"),
    (re.compile(r"WhatsApp", re.I), "whatsapp", "social"),
    (re.compile(r"Pinterestbot", re.I), "pinterestbot", "social"),
    # SEO
    (re.compile(r"AhrefsBot", re.I), "ahrefsbot", "seo"),
    (re.compile(r"SemrushBot", re.I), "semrushbot", "seo"),
    (re.compile(r"DotBot", re.I), "dotbot", "seo"),
    (re.compile(r"MJ12bot", re.I), "mj12bot", "seo"),
    (re.compile(r"DataForSeoBot", re.I), "dataforseobot", "seo"),
    (re.compile(r"Screaming Frog", re.I), "screamingfrog", "seo"),
    (re.compile(r"BLEXBot", re.I), "blexbot", "seo"),
    # Monitoring
    (re.compile(r"UptimeRobot", re.I), "uptimerobot", "monitoring"),
    (re.compile(r"Pingdom", re.I), "pingdom", "monitoring"),
    (re.compile(r"NewRelicPinger", re.I), "newrelicpinger", "monitoring"),
    (re.compile(r"Datadog", re.I), "datadoghq", "monitoring"),
    (re.compile(r"Site24x7", re.I), "site24x7", "monitoring"),
]

def identify_bot(ua: str):
    for pattern, name, category in BOT_PATTERNS:
        if pattern.search(ua):
            return {"name": name, "category": category}
    return None

class BotTrackingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        ua = request.headers.get("user-agent", "")
        bot = identify_bot(ua)
        if bot:
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(
                        "https://www.bluemonitor.org/api/v1/bot-visits",
                        headers={
                            "Authorization": f"Bearer {os.getenv('BLUEMONITOR_API_KEY')}"
                        },
                        json={
                            "domain": "yourapp.com",
                            "visits": [{
                                "bot_name": bot["name"],
                                "bot_category": bot["category"],
                                "path": str(request.url.path),
                                "user_agent": ua,
                            }],
                        },
                        timeout=5,
                    )
            except Exception:
                pass
        return await call_next(request)

app.add_middleware(BotTrackingMiddleware)`}</code>
        </pre>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          View results in your{" "}
          <Link
            href="/dashboard"
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
          >
            dashboard
          </Link>{" "}
          under Bot Tracking.
        </p>
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
