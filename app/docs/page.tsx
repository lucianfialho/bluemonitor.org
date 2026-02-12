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
  example,
  response,
}: {
  method: string;
  path: string;
  description: string;
  params?: { name: string; description: string }[];
  query?: { name: string; description: string; default?: string }[];
  example: string;
  response: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
            {method}
          </span>
          <code className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {path}
          </code>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>

      <div className="space-y-4 px-5 py-4">
        {params && params.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Path Parameters
            </h4>
            <div className="space-y-1">
              {params.map((p) => (
                <div key={p.name} className="flex gap-2 text-sm">
                  <code className="font-medium text-blue-600 dark:text-blue-400">
                    {p.name}
                  </code>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    — {p.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && query.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Query Parameters
            </h4>
            <div className="space-y-1">
              {query.map((q) => (
                <div key={q.name} className="flex gap-2 text-sm">
                  <code className="font-medium text-blue-600 dark:text-blue-400">
                    {q.name}
                  </code>
                  <span className="text-zinc-600 dark:text-zinc-400">
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

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Example
          </h4>
          <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-3 text-sm text-green-400">
            <code>{example}</code>
          </pre>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Response
          </h4>
          <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-3 text-sm text-zinc-300">
            <code>{response}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Home
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">API Docs</span>
      </nav>

      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          API Documentation
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Free REST API to monitor the status of 500+ services. No authentication
          required — optional API keys unlock higher rate limits.
        </p>
      </div>

      {/* Base URL */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Base URL
        </h2>
        <pre className="rounded-lg bg-zinc-950 p-3 text-sm text-zinc-300">
          <code>https://www.bluemonitor.org/api/v1</code>
        </pre>
      </section>

      {/* Authentication */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Authentication
        </h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Authentication is <strong>optional</strong>. All endpoints work without an API
          key, but authenticated requests get higher rate limits (60/min vs 15/min).
        </p>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          To get an API key,{" "}
          <Link href="/auth/sign-in" className="text-blue-600 hover:underline dark:text-blue-400">
            sign in with GitHub
          </Link>{" "}
          and create one from your{" "}
          <Link href="/dashboard" className="text-blue-600 hover:underline dark:text-blue-400">
            dashboard
          </Link>
          .
        </p>
        <div className="mb-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Example
          </h4>
          <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-3 text-sm text-green-400">
            <code>{`curl -H "Authorization: Bearer bm_your_api_key" \\
  https://www.bluemonitor.org/api/v1/services`}</code>
          </pre>
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Tier
                </th>
                <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Rate Limit
                </th>
                <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Auth Required
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">Anonymous</td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">15 req/min per IP</td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">No</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">Authenticated</td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">60 req/min per key</td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  <code className="text-xs">Authorization: Bearer bm_...</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Rate Limiting
        </h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          All endpoints are rate limited. Anonymous requests are limited to{" "}
          <strong>15 requests per minute</strong> per IP, and authenticated requests to{" "}
          <strong>60 per minute</strong> per API key. Rate limit information is included
          in response headers:
        </p>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Header
                </th>
                <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td className="px-4 py-2">
                  <code className="text-xs">X-RateLimit-Limit</code>
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Maximum requests per window (60)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  <code className="text-xs">X-RateLimit-Remaining</code>
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Remaining requests in current window
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  <code className="text-xs">X-RateLimit-Reset</code>
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Unix timestamp when the window resets
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  <code className="text-xs">Retry-After</code>
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Seconds to wait (only on 429 responses)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Endpoints */}
      <section className="mb-10">
        <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
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
        </div>
      </section>

      {/* Status Values */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Status Values
        </h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Value
                </th>
                <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td className="px-4 py-2">
                  <code className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                    up
                  </code>
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Service is operational (response &lt; 3s)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  <code className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                    slow
                  </code>
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Service is responding slowly (response &gt; 3s)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-900 dark:text-red-300">
                    down
                  </code>
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Service is unreachable or returning errors
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    unknown
                  </code>
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Not yet checked
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "ai", "social-media", "gaming", "streaming", "productivity",
            "cloud", "finance", "communication", "ecommerce", "developer",
            "education", "delivery", "vpn", "entertainment", "isp",
            "dating", "logistics", "travel",
          ].map((cat) => (
            <code
              key={cat}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {cat}
            </code>
          ))}
        </div>
      </section>

      {/* Errors */}
      <section>
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Errors
        </h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Code
                </th>
                <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td className="px-4 py-2 font-mono">401</td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Invalid API key
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">404</td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Service not found
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">429</td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Rate limit exceeded (15 req/min anonymous, 60 req/min authenticated)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">500</td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  Internal server error
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
