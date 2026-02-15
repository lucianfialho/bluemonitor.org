import { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "Rails Monitoring Setup",
  description:
    "Add uptime monitoring and heartbeat push to your Rails app. Health endpoint, ActiveJob heartbeats, and status badge.",
  alternates: {
    canonical: "/docs/rails",
  },
};

export default function RailsDocsPage() {
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
        <span className="text-zinc-900 dark:text-zinc-100">Rails</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Rails
      </h1>
      <p className="mt-4 text-zinc-500 dark:text-zinc-400">
        Add monitoring to your Rails app. Health check route, recurring
        ActiveJob heartbeats, and status badge.
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
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          config/routes.rb
        </p>
        <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`get "/api/health", to: "health#show"`}</code>
        </pre>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          app/controllers/health_controller.rb
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`class HealthController < ApplicationController
  skip_before_action :authenticate_user!, raise: false

  def show
    render json: { status: "ok" }
  end
end`}</code>
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
          Use a recurring job with Sidekiq or GoodJob. This example uses
          Sidekiq with sidekiq-cron.
        </p>
        <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-green-400 dark:bg-zinc-950">
          <code>{`gem "sidekiq-cron"`}</code>
        </pre>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          app/jobs/heartbeat_job.rb
        </p>
        <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`class HeartbeatJob < ApplicationJob
  queue_as :default

  def perform
    checks = {}

    # Database check
    db_start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    begin
      ActiveRecord::Base.connection.execute("SELECT 1")
      checks[:database] = {
        status: "ok",
        latency: ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - db_start) * 1000).round
      }
    rescue => e
      checks[:database] = {
        status: "error",
        latency: ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - db_start) * 1000).round,
        message: e.message
      }
    end

    # Redis check
    redis_start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    begin
      Redis.current.ping
      checks[:redis] = {
        status: "ok",
        latency: ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - redis_start) * 1000).round
      }
    rescue => e
      checks[:redis] = {
        status: "error",
        latency: ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - redis_start) * 1000).round
      }
    end

    has_error = checks.values.any? { |c| c[:status] == "error" }

    uri = URI("https://www.bluemonitor.org/api/v1/heartbeat")
    Net::HTTP.post(
      uri,
      {
        domain: "yourapp.com",
        status: has_error ? "error" : "ok",
        timestamp: Time.now.utc.iso8601,
        checks: checks
      }.to_json,
      "Authorization" => "Bearer #{ENV['BLUEMONITOR_API_KEY']}",
      "Content-Type" => "application/json"
    )
  end
end`}</code>
        </pre>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          config/initializers/sidekiq_cron.rb
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`Sidekiq::Cron::Job.create(
  name: "BlueMonitor heartbeat",
  cron: "*/5 * * * *",
  class: "HeartbeatJob"
)`}</code>
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
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          ERB template
        </p>
        <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`<a href="https://www.bluemonitor.org/status/your-domain-com">
  <img
    src="https://www.bluemonitor.org/api/badge/your-domain-com"
    alt="Status on BlueMonitor"
    height="36"
  />
</a>`}</code>
        </pre>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
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
          app/middleware/bot_tracking_middleware.rb
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`class BotTrackingMiddleware
  BOT_PATTERNS = [
    [/Googlebot/i, "googlebot", "search_engine"],
    [/bingbot/i, "bingbot", "search_engine"],
    [/GPTBot/i, "gptbot", "ai_crawler"],
    [/ClaudeBot/i, "claudebot", "ai_crawler"],
    [/PerplexityBot/i, "perplexitybot", "ai_crawler"],
    [/Twitterbot/i, "twitterbot", "social"],
    [/facebookexternalhit/i, "facebookbot", "social"],
    [/AhrefsBot/i, "ahrefsbot", "seo"],
  ].freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    ua = env["HTTP_USER_AGENT"] || ""
    bot = identify_bot(ua)
    if bot
      Thread.new do
        uri = URI("https://www.bluemonitor.org/api/v1/bot-visits")
        Net::HTTP.post(uri, {
          domain: "yourapp.com",
          visits: [{
            bot_name: bot[:name],
            bot_category: bot[:category],
            path: env["PATH_INFO"],
            user_agent: ua,
          }]
        }.to_json,
          "Authorization" => "Bearer #{ENV['BLUEMONITOR_API_KEY']}",
          "Content-Type" => "application/json"
        )
      rescue StandardError
      end
    end
    @app.call(env)
  end

  private

  def identify_bot(ua)
    BOT_PATTERNS.each do |pattern, name, category|
      return { name: name, category: category } if ua.match?(pattern)
    end
    nil
  end
end

# config/application.rb
# config.middleware.use BotTrackingMiddleware`}</code>
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
            monitoring for your Rails app automatically.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 truncate rounded-lg bg-white px-4 py-2.5 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              https://www.bluemonitor.org/llm-rails.txt
            </code>
            <CopyButton text="https://www.bluemonitor.org/llm-rails.txt" />
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
