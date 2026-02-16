import { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "Express Monitoring Setup",
  description:
    "Add uptime monitoring and heartbeat push to your Express app. Health endpoint, node-cron heartbeats, and status badge.",
  alternates: {
    canonical: "/docs/express",
  },
};

export default function ExpressDocsPage() {
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
        <span className="text-zinc-900 dark:text-zinc-100">Express</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Express
      </h1>
      <p className="mt-4 text-zinc-500 dark:text-zinc-400">
        Add monitoring to your Express app. Set up a health endpoint, push
        heartbeats with node-cron, and embed a status badge.
      </p>

      {/* Step 1: Health endpoint */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            1
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Health endpoint
          </h2>
        </div>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          A simple route that BlueMonitor pings every 5 minutes.
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});`}</code>
        </pre>
      </section>

      {/* Step 2: Heartbeat push */}
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
          Push detailed dependency health data on a schedule using{" "}
          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            node-cron
          </code>
          . Install it first:
        </p>
        <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-green-400 dark:bg-zinc-950">
          <code>{`npm install node-cron`}</code>
        </pre>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`import cron from "node-cron";

async function sendHeartbeat() {
  const checks = {};

  // Database check
  const dbStart = Date.now();
  try {
    await db.query("SELECT 1");
    checks.database = { status: "ok", latency: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      status: "error",
      latency: Date.now() - dbStart,
      message: err.message,
    };
  }

  // Add more checks: redis, external APIs, etc.

  const hasError = Object.values(checks).some((c) => c.status === "error");

  await fetch("https://www.bluemonitor.org/api/v1/heartbeat", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.BLUEMONITOR_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      domain: "yourapp.com",
      status: hasError ? "error" : "ok",
      timestamp: new Date().toISOString(),
      checks,
    }),
  });
}

// Every 5 minutes
cron.schedule("*/5 * * * *", sendHeartbeat);
sendHeartbeat(); // Send immediately on startup`}</code>
        </pre>
      </section>

      {/* Step 3: Status badge */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            3
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Status badge
          </h2>
        </div>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          If you serve HTML, add the badge. Replace{" "}
          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            your-domain-com
          </code>{" "}
          with your domain (dots become dashes).
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`<a href="https://www.bluemonitor.org/status/your-domain-com">
  <img
    src="https://www.bluemonitor.org/api/badge/your-domain-com"
    alt="Status on BlueMonitor"
    height="36"
  />
</a>`}</code>
        </pre>
        <p className="mt-4 mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          Markdown (README.md)
        </p>
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
          Express middleware
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`const BOT_PATTERNS = [
  // Search engines
  { pattern: /Googlebot/i, name: "googlebot", category: "search_engine" },
  { pattern: /bingbot/i, name: "bingbot", category: "search_engine" },
  { pattern: /YandexBot/i, name: "yandexbot", category: "search_engine" },
  { pattern: /Baiduspider/i, name: "baiduspider", category: "search_engine" },
  { pattern: /DuckDuckBot/i, name: "duckduckbot", category: "search_engine" },
  { pattern: /Applebot/i, name: "applebot", category: "search_engine" },
  { pattern: /PetalBot/i, name: "petalbot", category: "search_engine" },
  { pattern: /Sogou/i, name: "sogoubot", category: "search_engine" },
  { pattern: /NaverBot/i, name: "naverbot", category: "search_engine" },
  { pattern: /Seznambot/i, name: "seznambot", category: "search_engine" },
  // AI crawlers
  { pattern: /GPTBot/i, name: "gptbot", category: "ai_crawler" },
  { pattern: /ChatGPT-User/i, name: "chatgpt-user", category: "ai_crawler" },
  { pattern: /OAI-SearchBot/i, name: "oai-searchbot", category: "ai_crawler" },
  { pattern: /ClaudeBot/i, name: "claudebot", category: "ai_crawler" },
  { pattern: /anthropic-ai/i, name: "anthropic-ai", category: "ai_crawler" },
  { pattern: /PerplexityBot/i, name: "perplexitybot", category: "ai_crawler" },
  { pattern: /Bytespider/i, name: "bytespider", category: "ai_crawler" },
  { pattern: /CCBot/i, name: "ccbot", category: "ai_crawler" },
  { pattern: /Meta-ExternalAgent/i, name: "meta-externalagent", category: "ai_crawler" },
  { pattern: /Google-Extended/i, name: "google-extended", category: "ai_crawler" },
  { pattern: /Amazonbot/i, name: "amazonbot", category: "ai_crawler" },
  { pattern: /cohere-ai/i, name: "cohere-ai", category: "ai_crawler" },
  { pattern: /DeepSeekBot/i, name: "deepseekbot", category: "ai_crawler" },
  { pattern: /YouBot/i, name: "youbot", category: "ai_crawler" },
  { pattern: /AI2Bot/i, name: "ai2bot", category: "ai_crawler" },
  { pattern: /Timpibot/i, name: "timpibot", category: "ai_crawler" },
  // Social
  { pattern: /Twitterbot/i, name: "twitterbot", category: "social" },
  { pattern: /facebookexternalhit/i, name: "facebookbot", category: "social" },
  { pattern: /LinkedInBot/i, name: "linkedinbot", category: "social" },
  { pattern: /Slackbot/i, name: "slackbot", category: "social" },
  { pattern: /Discordbot/i, name: "discordbot", category: "social" },
  { pattern: /TelegramBot/i, name: "telegrambot", category: "social" },
  { pattern: /WhatsApp/i, name: "whatsapp", category: "social" },
  { pattern: /Pinterestbot/i, name: "pinterestbot", category: "social" },
  // SEO
  { pattern: /AhrefsBot/i, name: "ahrefsbot", category: "seo" },
  { pattern: /SemrushBot/i, name: "semrushbot", category: "seo" },
  { pattern: /DotBot/i, name: "dotbot", category: "seo" },
  { pattern: /MJ12bot/i, name: "mj12bot", category: "seo" },
  { pattern: /DataForSeoBot/i, name: "dataforseobot", category: "seo" },
  { pattern: /Screaming Frog/i, name: "screamingfrog", category: "seo" },
  { pattern: /BLEXBot/i, name: "blexbot", category: "seo" },
  // Monitoring
  { pattern: /UptimeRobot/i, name: "uptimerobot", category: "monitoring" },
  { pattern: /Pingdom/i, name: "pingdom", category: "monitoring" },
  { pattern: /NewRelicPinger/i, name: "newrelicpinger", category: "monitoring" },
  { pattern: /Datadog/i, name: "datadoghq", category: "monitoring" },
  { pattern: /Site24x7/i, name: "site24x7", category: "monitoring" },
];

function identifyBot(ua) {
  for (const bot of BOT_PATTERNS) {
    if (bot.pattern.test(ua)) return bot;
  }
  return null;
}

// If on serverless (Lambda, etc.), use await
app.use(async (req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  const bot = identifyBot(ua);
  if (bot) {
    await fetch("https://www.bluemonitor.org/api/v1/bot-visits", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${process.env.BLUEMONITOR_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: "yourapp.com",
        visits: [{
          bot_name: bot.name,
          bot_category: bot.category,
          path: req.path,
          user_agent: ua,
        }],
      }),
    }).catch(() => {});
  }
  next();
});`}</code>
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
            monitoring for your Express app automatically.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 truncate rounded-lg bg-white px-4 py-2.5 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              https://www.bluemonitor.org/llm-express.txt
            </code>
            <CopyButton text="https://www.bluemonitor.org/llm-express.txt" />
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
            <li>
              <Link
                href="/dashboard"
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
              >
                Dashboard
              </Link>{" "}
              — set up webhook alerts
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
