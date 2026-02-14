import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MCP Integration — BlueMonitor",
  description:
    "Connect BlueMonitor to AI assistants like Claude, Cursor, and Windsurf using the Model Context Protocol (MCP).",
  alternates: {
    canonical: "/docs/mcp",
  },
};

function ToolCard({ name, description }: { name: string; description: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
      <code className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</code>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}

export default function McpDocsPage() {
  return (
    <div className="prose-custom">
      <div className="mb-2 flex items-center gap-2">
        <h1 className="mb-0 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          MCP Integration
        </h1>
        <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
          PRO
        </span>
      </div>
      <p className="mb-8 text-lg text-zinc-500 dark:text-zinc-400">
        Connect BlueMonitor to AI assistants using the Model Context Protocol.
      </p>

      {/* What is MCP */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          What is MCP?
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          The{" "}
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Model Context Protocol (MCP)
          </a>{" "}
          is an open standard that connects AI assistants to external tools and data sources.
          With BlueMonitor&apos;s MCP server, your AI assistant can check service status, list your watchlist,
          get incidents, and query heartbeat data — all from within your conversation.
        </p>
      </section>

      {/* What you can do */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          What You Can Do
        </h2>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex gap-2">
            <span className="mt-0.5 text-green-500">&#10003;</span>
            Check the real-time status of any monitored service
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-green-500">&#10003;</span>
            List all services in your watchlist with current status
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-green-500">&#10003;</span>
            Get recent incidents and outage history
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-green-500">&#10003;</span>
            Query heartbeat data and health check results
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-green-500">&#10003;</span>
            Check any domain&apos;s current status
          </li>
        </ul>
      </section>

      {/* Supported clients */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Supported Clients
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { name: "Claude Desktop", desc: "Anthropic's desktop app" },
            { name: "Cursor", desc: "AI-powered code editor" },
            { name: "Windsurf", desc: "AI coding assistant" },
          ].map((client) => (
            <div
              key={client.name}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{client.name}</p>
              <p className="text-xs text-zinc-500">{client.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Any MCP-compatible client can connect to BlueMonitor.
        </p>
      </section>

      {/* Setup */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Setup
        </h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Add the following to your MCP client configuration (e.g.{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">claude_desktop_config.json</code>{" "}
          or your editor&apos;s MCP settings):
        </p>
        <div className="overflow-hidden rounded-xl bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
            <span className="text-xs text-zinc-500">MCP Configuration</span>
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-zinc-300">
{`{
  "mcpServers": {
    "bluemonitor": {
      "url": "https://www.bluemonitor.org/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`}
          </pre>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Replace <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">YOUR_API_KEY</code>{" "}
          with your actual API key from the{" "}
          <Link href="/dashboard" className="text-blue-600 hover:underline dark:text-blue-400">
            dashboard
          </Link>.
        </p>
      </section>

      {/* Available tools */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Available Tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ToolCard
            name="list_services"
            description="List all monitored services with their current status, response time, and last check time."
          />
          <ToolCard
            name="check_status"
            description="Get the detailed status of a specific service by slug, including recent checks."
          />
          <ToolCard
            name="list_watchlist"
            description="List all services in your personal watchlist with current status."
          />
          <ToolCard
            name="get_incidents"
            description="Get recent incidents and outage history across all services."
          />
          <ToolCard
            name="check_domain"
            description="Check the current status of any domain, whether monitored or not."
          />
        </div>
      </section>

      {/* Requirements */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Requirements
        </h2>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">Pro plan</span>
            — MCP access requires an active Pro subscription.{" "}
            <Link href="/pricing" className="text-blue-600 hover:underline dark:text-blue-400">
              Upgrade
            </Link>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">API key</span>
            — Create one from the{" "}
            <Link href="/dashboard" className="text-blue-600 hover:underline dark:text-blue-400">
              dashboard
            </Link>.
          </li>
        </ul>
      </section>
    </div>
  );
}
