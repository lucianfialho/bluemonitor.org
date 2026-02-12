import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Documentation — BlueMonitor",
  description:
    "Free REST API to check the status of 500+ services. Get real-time status, response times, and incident history programmatically.",
  alternates: {
    canonical: "/docs",
  },
};

function Endpoint({
  method,
  path,
  description,
  params,
  query,
  body,
  example,
  response,
}: {
  method: string;
  path: string;
  description: string;
  params?: { name: string; description: string }[];
  query?: { name: string; description: string; default?: string }[];
  body?: string;
  example: string;
  response: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">
      <div className="border-b border-zinc-200/70 px-6 py-5 dark:border-zinc-700/50">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              method === "POST"
                ? "bg-blue-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {method}
          </span>
          <code className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {path}
          </code>
        </div>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      <div className="space-y-4 px-6 py-5">
        {params && params.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Path Parameters
            </h4>
            <div className="space-y-1">
              {params.map((p) => (
                <div key={p.name} className="flex gap-2 text-sm">
                  <code className="font-medium text-zinc-900 dark:text-zinc-100">
                    {p.name}
                  </code>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    — {p.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && query.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Query Parameters
            </h4>
            <div className="space-y-1">
              {query.map((q) => (
                <div key={q.name} className="flex gap-2 text-sm">
                  <code className="font-medium text-zinc-900 dark:text-zinc-100">
                    {q.name}
                  </code>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    — {q.description}
                    {q.default && (
                      <span className="ml-1 text-zinc-400">
                        (default: {q.default})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {body && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Request Body
            </h4>
            <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-3 text-sm text-zinc-300 dark:bg-zinc-950">
              <code>{body}</code>
            </pre>
          </div>
        )}

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Example
          </h4>
          <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-3 text-sm text-green-400 dark:bg-zinc-950">
            <code>{example}</code>
          </pre>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Response
          </h4>
          <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-3 text-sm text-zinc-300 dark:bg-zinc-950">
            <code>{response}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="px-4 pt-20 pb-12 text-center sm:px-6 sm:pt-28 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[2.75rem] leading-[1.08] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl lg:text-6xl">
            API Documentation.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
            Free REST API to monitor the status of 500+ services. No
            authentication required — optional API keys unlock higher rate
            limits.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 sm:pb-28">
        {/* Base URL */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Base URL
          </h2>
          <pre className="rounded-xl bg-zinc-900 p-3 text-sm text-zinc-300 dark:bg-zinc-950">
            <code>https://www.bluemonitor.org/api/v1</code>
          </pre>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Authentication
          </h2>
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            Authentication is <strong className="text-zinc-700 dark:text-zinc-300">optional</strong>. All
            endpoints work without an API key, but authenticated requests get
            higher rate limits (60/min vs 15/min).
          </p>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            To get an API key,{" "}
            <Link
              href="/auth/sign-in"
              className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
            >
              sign in with GitHub
            </Link>{" "}
            and create one from your{" "}
            <Link
              href="/dashboard"
              className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
            >
              dashboard
            </Link>
            .
          </p>
          <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-900 p-3 text-sm text-green-400 dark:bg-zinc-950">
            <code>{`curl -H "Authorization: Bearer bm_your_api_key" \\
  https://www.bluemonitor.org/api/v1/services`}</code>
          </pre>
          <div className="overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200/70 dark:border-zinc-700/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Tier
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Rate Limit
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Auth Required
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-700/50">
                <tr>
                  <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    Anonymous
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    15 req/min per IP
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    No
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    Authenticated
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    60 req/min per key
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    <code className="text-xs">Authorization: Bearer bm_...</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Rate Limiting */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Rate Limiting
          </h2>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            All endpoints are rate limited. Rate limit information is included in
            response headers:
          </p>
          <div className="overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200/70 dark:border-zinc-700/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Header
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-700/50">
                <tr>
                  <td className="px-5 py-3">
                    <code className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      X-RateLimit-Limit
                    </code>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Maximum requests per window (60)
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3">
                    <code className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      X-RateLimit-Remaining
                    </code>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Remaining requests in current window
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3">
                    <code className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      X-RateLimit-Reset
                    </code>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Unix timestamp when the window resets
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3">
                    <code className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      Retry-After
                    </code>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Seconds to wait (only on 429 responses)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Endpoints
          </h2>
          <div className="space-y-6">
            <Endpoint
              method="GET"
              path="/api/v1/status/:slug"
              description="Get the current status of a specific service."
              params={[
                {
                  name: ":slug",
                  description:
                    'Service identifier (e.g., "chatgpt", "discord", "github")',
                },
              ]}
              example="curl https://www.bluemonitor.org/api/v1/status/chatgpt"
              response={`{
  "slug": "chatgpt",
  "name": "ChatGPT",
  "domain": "chatgpt.com",
  "category": "ai",
  "status": "up",
  "response_time": 245,
  "last_checked": "2026-02-12T03:15:00.000Z",
  "latest_check": {
    "status": "up",
    "response_time": 245,
    "status_code": 200,
    "checked_at": "2026-02-12T03:15:00.000Z"
  }
}`}
            />

            <Endpoint
              method="GET"
              path="/api/v1/services"
              description="List all monitored services with their current status."
              query={[
                {
                  name: "category",
                  description:
                    "Filter by category (ai, gaming, social-media, streaming, etc.)",
                },
                {
                  name: "limit",
                  description: "Number of results to return (max 500)",
                  default: "100",
                },
                {
                  name: "offset",
                  description: "Pagination offset",
                  default: "0",
                },
              ]}
              example="curl https://www.bluemonitor.org/api/v1/services?category=ai&limit=10"
              response={`{
  "services": [
    {
      "slug": "chatgpt",
      "name": "ChatGPT",
      "domain": "chatgpt.com",
      "category": "ai",
      "status": "up",
      "response_time": 245,
      "last_checked": "2026-02-12T03:15:00.000Z"
    }
  ],
  "total": 45,
  "limit": 10,
  "offset": 0
}`}
            />

            <Endpoint
              method="GET"
              path="/api/v1/incidents"
              description="Get recent incidents across all monitored services."
              query={[
                {
                  name: "status",
                  description:
                    "Filter by status (investigating, identified, monitoring, resolved)",
                },
                {
                  name: "limit",
                  description: "Number of results (max 100)",
                  default: "50",
                },
                {
                  name: "offset",
                  description: "Pagination offset",
                  default: "0",
                },
              ]}
              example="curl https://www.bluemonitor.org/api/v1/incidents?status=investigating&limit=5"
              response={`{
  "incidents": [
    {
      "id": "abc123",
      "title": "Elevated error rates on API",
      "description": "We are investigating elevated error rates.",
      "severity": "major",
      "status": "investigating",
      "started_at": "2026-02-12T01:00:00.000Z",
      "resolved_at": null,
      "source_url": "https://status.example.com/incidents/abc123",
      "service": {
        "name": "Example Service",
        "slug": "example"
      }
    }
  ],
  "limit": 5,
  "offset": 0
}`}
            />

            <Endpoint
              method="GET"
              path="/api/v1/incidents/:slug"
              description="Get incidents for a specific service."
              params={[
                {
                  name: ":slug",
                  description: "Service identifier",
                },
              ]}
              query={[
                {
                  name: "limit",
                  description: "Number of results (max 50)",
                  default: "20",
                },
              ]}
              example="curl https://www.bluemonitor.org/api/v1/incidents/claude"
              response={`{
  "service": {
    "name": "Claude",
    "slug": "claude"
  },
  "incidents": [
    {
      "id": "xyz789",
      "title": "Elevated errors on Claude Opus 4.6",
      "description": "This incident has been resolved.",
      "severity": "minor",
      "status": "resolved",
      "started_at": "2026-02-11T08:21:00.000Z",
      "resolved_at": "2026-02-11T09:00:00.000Z",
      "source_url": "https://status.anthropic.com/..."
    }
  ]
}`}
            />
            <Endpoint
              method="POST"
              path="/api/v1/heartbeat?domain=:domain"
              description="Push a heartbeat from your service. Requires API key. Service must be in your watchlist."
              query={[
                {
                  name: "domain",
                  description:
                    "The domain of your service (e.g., myapp.com)",
                },
              ]}
              body={`{
  "status": "ok",
  "timestamp": "2026-02-12T12:00:00.000Z",
  "checks": {
    "database": { "status": "ok", "latency": 5 },
    "redis": { "status": "ok", "latency": 2 }
  }
}`}
              example={`curl -X POST "https://www.bluemonitor.org/api/v1/heartbeat?domain=myapp.com" \\
  -H "Authorization: Bearer bm_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"ok","checks":{"database":{"status":"ok","latency":5}}}'`}
              response={`{
  "ok": true,
  "service": "My App",
  "status": "up",
  "response_time": 5,
  "checked_at": "2026-02-12T12:00:00.000Z"
}`}
            />
          </div>
        </section>

        {/* Badge */}
        <section className="mb-12">
          <h2 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Status Badge
          </h2>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Embed a real-time status badge on your website, README, or docs. The
            badge is a PNG image that updates automatically.
          </p>
          <div className="space-y-6">
            <Endpoint
              method="GET"
              path="/api/badge/:slug"
              description="Returns a PNG status badge image for a service."
              params={[
                {
                  name: ":slug",
                  description:
                    'Domain with dots replaced by dashes (e.g., "github-com", "vercel-com")',
                },
              ]}
              query={[
                {
                  name: "theme",
                  description: "Badge color theme",
                  default: "light",
                },
              ]}
              example="curl -o badge.png https://www.bluemonitor.org/api/badge/github-com"
              response={`PNG image (280x36px)

Content-Type: image/png
Cache-Control: public, s-maxage=300, stale-while-revalidate=60`}
            />
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                HTML
              </h4>
              <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-3 text-sm text-green-400 dark:bg-zinc-950">
                <code>{`<a href="https://www.bluemonitor.org/status/your-domain-com">
  <img src="https://www.bluemonitor.org/api/badge/your-domain-com" alt="Status" />
</a>`}</code>
              </pre>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Markdown
              </h4>
              <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-3 text-sm text-green-400 dark:bg-zinc-950">
                <code>{`[![Status](https://www.bluemonitor.org/api/badge/your-domain-com)](https://www.bluemonitor.org/status/your-domain-com)`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Status Values */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Status Values
          </h2>
          <div className="overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200/70 dark:border-zinc-700/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Value
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-700/50">
                <tr>
                  <td className="px-5 py-3">
                    <code className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      up
                    </code>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Service is operational (response &lt; 3s)
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3">
                    <code className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      slow
                    </code>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Service is responding slowly (response &gt; 3s)
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3">
                    <code className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      down
                    </code>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Service is unreachable or returning errors
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3">
                    <code className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                      unknown
                    </code>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Not yet checked
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              "ai",
              "social-media",
              "gaming",
              "streaming",
              "productivity",
              "cloud",
              "finance",
              "communication",
              "ecommerce",
              "developer",
              "education",
              "delivery",
              "vpn",
              "entertainment",
              "isp",
              "dating",
              "logistics",
              "travel",
            ].map((cat) => (
              <code
                key={cat}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {cat}
              </code>
            ))}
          </div>
        </section>

        {/* Errors */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Errors
          </h2>
          <div className="overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200/70 dark:border-zinc-700/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Code
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-700/50">
                <tr>
                  <td className="px-5 py-3 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    401
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Invalid API key
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    404
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Service not found
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    429
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Rate limit exceeded
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    500
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    Internal server error
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
