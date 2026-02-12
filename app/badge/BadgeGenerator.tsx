"use client";

import { useState } from "react";

function slugify(domain: string): string {
  return domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export default function BadgeGenerator() {
  const [domain, setDomain] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const slug = slugify(domain);
  const baseUrl = "https://www.bluemonitor.org";
  const badgeUrl = slug
    ? `${baseUrl}/api/badge/${slug}${theme === "dark" ? "?theme=dark" : ""}`
    : "";
  const statusUrl = slug ? `${baseUrl}/status/${slug}` : "";

  const htmlCode = slug
    ? `<a href="${statusUrl}" target="_blank" rel="noopener">\n  <img src="${badgeUrl}" alt="Status on BlueMonitor" />\n</a>`
    : "";

  const markdownCode = slug
    ? `[![Status on BlueMonitor](${badgeUrl})](${statusUrl})`
    : "";

  return (
    <div className="space-y-8">
      {/* Input */}
      <div>
        <label
          htmlFor="domain"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Your domain
        </label>
        <input
          id="domain"
          type="text"
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {/* Theme toggle */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Theme
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              theme === "light"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            Dark
          </button>
        </div>
      </div>

      {slug && (
        <>
          {/* Preview */}
          <div>
            <h2 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Preview
            </h2>
            <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={badgeUrl} alt="Badge preview" height={36} />
            </div>
          </div>

          {/* HTML */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                HTML
              </h2>
              <CopyButton text={htmlCode} />
            </div>
            <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-300">
              <code>{htmlCode}</code>
            </pre>
          </div>

          {/* Markdown */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Markdown
              </h2>
              <CopyButton text={markdownCode} />
            </div>
            <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-300">
              <code>{markdownCode}</code>
            </pre>
          </div>

          {/* How it works */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-300">
              How it works
            </h3>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
              <li>
                The badge automatically registers your service on BlueMonitor
                as <strong>Pending</strong>.
              </li>
              <li>
                Once approved, it will show your real-time status:{" "}
                <strong>Operational</strong>, <strong>Slow</strong>, or{" "}
                <strong>Down</strong>.
              </li>
              <li>
                The badge updates every 5 minutes and is cached for
                performance.
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-md px-3 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
