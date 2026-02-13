import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Laravel Monitoring Setup — BlueMonitor",
  description:
    "Add uptime monitoring and heartbeat push to your Laravel app. Health endpoint, Laravel Scheduler heartbeats, and status badge.",
  alternates: {
    canonical: "/docs/laravel",
  },
};

export default function LaravelDocsPage() {
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
        <span className="text-zinc-900 dark:text-zinc-100">Laravel</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Laravel
      </h1>
      <p className="mt-4 text-zinc-500 dark:text-zinc-400">
        Add monitoring to your Laravel app. Health endpoint, Laravel Scheduler
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
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          routes/api.php
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});`}</code>
        </pre>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          This exposes{" "}
          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            GET /api/health
          </code>{" "}
          — Laravel prefixes API routes with{" "}
          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            /api
          </code>{" "}
          by default.
        </p>
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
          Use an Artisan command with Laravel Scheduler to push heartbeats every
          5 minutes.
        </p>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          app/Console/Commands/SendHeartbeat.php
        </p>
        <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`<?php

namespace App\\Console\\Commands;

use Illuminate\\Console\\Command;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Redis;

class SendHeartbeat extends Command
{
    protected $signature = 'heartbeat:send';
    protected $description = 'Send health heartbeat to BlueMonitor';

    public function handle()
    {
        $checks = [];

        // Database check
        $dbStart = microtime(true);
        try {
            DB::select('SELECT 1');
            $checks['database'] = [
                'status' => 'ok',
                'latency' => round((microtime(true) - $dbStart) * 1000),
            ];
        } catch (\\Exception $e) {
            $checks['database'] = [
                'status' => 'error',
                'latency' => round((microtime(true) - $dbStart) * 1000),
                'message' => $e->getMessage(),
            ];
        }

        // Redis check
        $redisStart = microtime(true);
        try {
            Redis::ping();
            $checks['redis'] = [
                'status' => 'ok',
                'latency' => round((microtime(true) - $redisStart) * 1000),
            ];
        } catch (\\Exception $e) {
            $checks['redis'] = [
                'status' => 'error',
                'latency' => round((microtime(true) - $redisStart) * 1000),
            ];
        }

        $hasError = collect($checks)->contains('status', 'error');

        Http::withToken(config('services.bluemonitor.key'))
            ->post('https://www.bluemonitor.org/api/v1/heartbeat', [
                'domain' => 'yourapp.com',
                'status' => $hasError ? 'error' : 'ok',
                'timestamp' => now()->toISOString(),
                'checks' => $checks,
            ]);

        $this->info('Heartbeat sent.');
    }
}`}</code>
        </pre>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          routes/console.php (Laravel 11+)
        </p>
        <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`Schedule::command('heartbeat:send')->everyFiveMinutes();`}</code>
        </pre>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          config/services.php
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`'bluemonitor' => [
    'key' => env('BLUEMONITOR_API_KEY'),
],`}</code>
        </pre>
        <p className="mb-2 mt-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          .env
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`BLUEMONITOR_API_KEY=bm_your_api_key`}</code>
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
          Blade template
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
