import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rails Monitoring Setup — BlueMonitor",
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

    uri = URI("https://www.bluemonitor.org/api/v1/heartbeat?domain=yourapp.com")
    Net::HTTP.post(
      uri,
      {
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
