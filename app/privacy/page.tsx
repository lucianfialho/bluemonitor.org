import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — BlueMonitor",
  description:
    "Learn how BlueMonitor collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Privacy Policy</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Privacy Policy
      </h1>
      <p className="mb-10 text-sm text-zinc-500 dark:text-zinc-400">
        Last updated: February 14, 2026
      </p>

      <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-semibold prose-h2:mt-10 prose-h2:text-xl prose-h3:text-lg prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-li:text-zinc-600 dark:prose-li:text-zinc-400 prose-a:text-blue-600 dark:prose-a:text-blue-400">
        <h2>1. Introduction</h2>
        <p>
          BlueMonitor (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website{" "}
          <strong>www.bluemonitor.org</strong> and related services. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your
          information when you visit our website or use our services.
        </p>

        <h2>2. Information We Collect</h2>

        <h3>2.1 Account Information</h3>
        <p>
          When you create an account, we collect your email address and display
          name. Authentication is handled securely through our authentication
          provider (Neon Auth / Better Auth). We do not store your password
          directly.
        </p>

        <h3>2.2 Usage Data</h3>
        <p>We automatically collect certain information when you use our services, including:</p>
        <ul>
          <li>IP address (used for rate limiting and security)</li>
          <li>Browser type and version</li>
          <li>Pages visited and features used</li>
          <li>Timestamps of requests</li>
        </ul>

        <h3>2.3 Watchlist and Monitoring Data</h3>
        <p>
          When you add services to your watchlist or configure webhook
          notifications, we store this information to provide our monitoring
          service. If you use our heartbeat (push monitoring) feature, we store
          health check data sent by your services.
        </p>

        <h3>2.4 Payment Information</h3>
        <p>
          When you subscribe to our Pro plan, payment processing is handled
          entirely by <strong>Stripe</strong>. We do not store credit card
          numbers or other sensitive payment details on our servers. We only
          store your Stripe customer ID and subscription status to manage your
          plan.
        </p>

        <h3>2.5 API Keys</h3>
        <p>
          If you generate API keys to access our API, we store a hashed version
          of the key. The full key is shown to you only once at creation time.
        </p>

        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, operate, and maintain our services</li>
          <li>Process your transactions and manage your subscription</li>
          <li>Send you webhook notifications about service status changes</li>
          <li>Enforce rate limits and prevent abuse</li>
          <li>Improve and personalize your experience</li>
          <li>Communicate with you about updates or issues related to your account</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>4. Data Retention</h2>
        <ul>
          <li>
            <strong>Account data:</strong> Retained as long as your account is
            active. You can request deletion at any time.
          </li>
          <li>
            <strong>Monitoring history:</strong> Status check history is retained
            for up to 30 days (Pro plan) or 1 day (Free plan), then
            automatically deleted.
          </li>
          <li>
            <strong>Heartbeat check data:</strong> Retained for up to 30 days,
            then automatically deleted.
          </li>
          <li>
            <strong>Server logs:</strong> Retained for up to 30 days for
            security and debugging purposes.
          </li>
        </ul>

        <h2>5. Third-Party Services</h2>
        <p>We use the following third-party services that may process your data:</p>
        <ul>
          <li>
            <strong>Stripe</strong> — Payment processing. See{" "}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stripe&apos;s Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Neon</strong> — Database hosting. See{" "}
            <a
              href="https://neon.tech/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Neon&apos;s Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Vercel</strong> — Website hosting and deployment. See{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vercel&apos;s Privacy Policy
            </a>
            .
          </li>
        </ul>

        <h2>6. Cookies</h2>
        <p>
          We use essential cookies to maintain your authentication session and
          preferences (such as dark mode). We do not use advertising or tracking
          cookies. No third-party analytics cookies are set.
        </p>

        <h2>7. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal data, including:
        </p>
        <ul>
          <li>Encrypted connections (HTTPS) for all data in transit</li>
          <li>Hashed API keys stored in the database</li>
          <li>Role-based access control for administrative functions</li>
          <li>Stripe webhook signature verification for payment events</li>
        </ul>
        <p>
          While we strive to use commercially acceptable means to protect your
          data, no method of transmission over the internet or electronic storage
          is 100% secure.
        </p>

        <h2>8. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and associated data</li>
          <li>Export your data in a portable format</li>
          <li>Withdraw consent for data processing (where applicable)</li>
          <li>Object to processing of your personal data</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at{" "}
          <a href="mailto:privacy@bluemonitor.org">privacy@bluemonitor.org</a>.
        </p>

        <h2>9. Private Monitoring</h2>
        <p>
          Pro plan users can mark their monitored services as &quot;private&quot;.
          Private services are not displayed in public listings or status pages.
          Only the account owner can view private service data through the
          dashboard.
        </p>

        <h2>10. Children&apos;s Privacy</h2>
        <p>
          Our services are not directed to individuals under the age of 13. We
          do not knowingly collect personal information from children. If we
          become aware that we have collected data from a child under 13, we will
          take steps to delete such information.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you
          of any changes by posting the new policy on this page and updating the
          &quot;Last updated&quot; date. Your continued use of the service after
          changes constitutes acceptance of the updated policy.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at{" "}
          <a href="mailto:privacy@bluemonitor.org">privacy@bluemonitor.org</a>.
        </p>
      </div>
    </div>
  );
}
