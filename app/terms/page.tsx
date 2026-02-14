import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — BlueMonitor",
  description:
    "Read the terms and conditions for using BlueMonitor services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Terms of Service</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Terms of Service
      </h1>
      <p className="mb-10 text-sm text-zinc-500 dark:text-zinc-400">
        Last updated: February 14, 2026
      </p>

      <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-semibold prose-h2:mt-10 prose-h2:text-xl prose-h3:text-lg prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-li:text-zinc-600 dark:prose-li:text-zinc-400 prose-a:text-blue-600 dark:prose-a:text-blue-400">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using BlueMonitor (&quot;the Service&quot;), operated
          at <strong>www.bluemonitor.org</strong>, you agree to be bound by
          these Terms of Service. If you do not agree to these terms, do not use
          the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          BlueMonitor provides real-time website and service status monitoring.
          Our features include:
        </p>
        <ul>
          <li>Automated status checks for public services</li>
          <li>Watchlist management for tracking services you depend on</li>
          <li>Webhook notifications for status changes</li>
          <li>Push monitoring (heartbeat) for your own services</li>
          <li>API access for programmatic monitoring</li>
          <li>Status badge embeds</li>
        </ul>

        <h2>3. Accounts</h2>
        <p>
          To access certain features, you must create an account. You are
          responsible for maintaining the security of your account credentials
          and for all activities that occur under your account. You must
          immediately notify us of any unauthorized use of your account.
        </p>

        <h2>4. Plans and Pricing</h2>
        <h3>4.1 Free Plan</h3>
        <p>
          The Free plan provides limited access to our features at no cost. Free
          plan limits include a maximum number of watchlist items, webhooks, and
          API requests as described on our{" "}
          <Link href="/pricing">pricing page</Link>.
        </p>

        <h3>4.2 Pro Plan</h3>
        <p>
          The Pro plan is a paid subscription that provides expanded limits and
          additional features. Pricing is as displayed on our pricing page at the
          time of subscription.
        </p>

        <h3>4.3 Billing</h3>
        <p>
          Pro plan subscriptions are billed monthly or annually through Stripe.
          By subscribing, you authorize us to charge the payment method on file
          for recurring fees until you cancel. You can manage or cancel your
          subscription at any time through the Stripe Customer Portal.
        </p>

        <h3>4.4 Refunds</h3>
        <p>
          We do not offer refunds for partial billing periods. If you cancel your
          subscription, you will retain access to Pro features until the end of
          your current billing period.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            Use the Service to conduct denial-of-service attacks or any form of
            network abuse
          </li>
          <li>
            Exceed rate limits or attempt to circumvent usage restrictions
          </li>
          <li>
            Use the API or heartbeat features to monitor services without
            authorization
          </li>
          <li>
            Share or resell API keys or account access
          </li>
          <li>
            Submit false or misleading information
          </li>
          <li>
            Use the Service for any unlawful purpose
          </li>
        </ul>

        <h2>6. Service Availability</h2>
        <p>
          We strive to maintain high availability but do not guarantee
          uninterrupted access to the Service. Status checks are automated and
          may not reflect all types of outages. BlueMonitor should not be used as
          the sole indicator of service health for critical systems.
        </p>

        <h2>7. API Usage</h2>
        <p>
          API access is subject to rate limits based on your plan. We reserve the
          right to throttle or suspend API access if usage patterns are
          abusive or negatively impact the Service for other users.
        </p>

        <h2>8. Intellectual Property</h2>
        <p>
          The Service, including its design, code, and content, is owned by
          BlueMonitor and protected by applicable intellectual property laws. You
          may use our status badge embeds on your own websites, but you may not
          reproduce, modify, or distribute other parts of the Service without
          permission.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, BlueMonitor shall not be liable
          for any indirect, incidental, special, consequential, or punitive
          damages, including but not limited to loss of profits, data, or
          business opportunities, arising from your use of the Service.
        </p>
        <p>
          Our total liability for any claim arising from or related to the
          Service shall not exceed the amount you have paid us in the twelve (12)
          months preceding the claim.
        </p>

        <h2>10. Disclaimer of Warranties</h2>
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot;
          without warranties of any kind, whether express or implied, including
          but not limited to warranties of merchantability, fitness for a
          particular purpose, and non-infringement.
        </p>

        <h2>11. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account at any time
          for violation of these terms. You may delete your account at any time
          by contacting us. Upon termination, your right to use the Service
          ceases immediately.
        </p>

        <h2>12. Changes to Terms</h2>
        <p>
          We may update these terms from time to time. We will notify users of
          material changes by posting the updated terms on this page. Your
          continued use of the Service after changes constitutes acceptance of
          the updated terms.
        </p>

        <h2>13. Contact</h2>
        <p>
          If you have questions about these Terms of Service, contact us at{" "}
          <a href="mailto:support@bluemonitor.org">support@bluemonitor.org</a>.
        </p>
      </div>
    </div>
  );
}
