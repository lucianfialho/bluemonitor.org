import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import HeaderWrapper from "@/components/HeaderWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: {
    default: "BlueMonitor — Real-Time Service Status Monitoring",
    template: "%s | BlueMonitor",
  },
  description:
    "Check if your favorite services are down. Real-time status monitoring, response times, and outage history for hundreds of popular services.",
  metadataBase: new URL("https://www.bluemonitor.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BlueMonitor — Real-Time Service Status Monitoring",
    description:
      "Check if your favorite services are down. Real-time status monitoring for hundreds of popular services.",
    url: "https://www.bluemonitor.org",
    siteName: "BlueMonitor",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "BlueMonitor — Don't let downtime kill your vibe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueMonitor — Real-Time Service Status Monitoring",
    description:
      "Check if your favorite services are down. Real-time status monitoring for hundreds of popular services.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-0P1450794K"
        strategy="lazyOnload"
      />
      <Script id="gtag-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-0P1450794K');`}
      </Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.bluemonitor.org/#organization",
                  name: "BlueMonitor",
                  url: "https://www.bluemonitor.org",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://www.bluemonitor.org/icon.svg",
                    width: 512,
                    height: 512,
                  },
                  description:
                    "Real-time service status monitoring platform. Check if your favorite services are down with uptime monitoring, heartbeat push, and instant alerts.",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.bluemonitor.org/#website",
                  url: "https://www.bluemonitor.org",
                  name: "BlueMonitor",
                  publisher: {
                    "@id": "https://www.bluemonitor.org/#organization",
                  },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate:
                        "https://www.bluemonitor.org/status/{search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "WebApplication",
                  "@id": "https://www.bluemonitor.org/#application",
                  name: "BlueMonitor",
                  url: "https://www.bluemonitor.org",
                  applicationCategory: "DeveloperApplication",
                  operatingSystem: "Web",
                  description:
                    "Pull-based health checks and push-based heartbeats in one platform with instant alerts and live status badges.",
                  offers: [
                    {
                      "@type": "Offer",
                      price: "0",
                      priceCurrency: "USD",
                      name: "Free",
                    },
                    {
                      "@type": "Offer",
                      price: "9",
                      priceCurrency: "USD",
                      name: "Pro",
                      priceSpecification: {
                        "@type": "UnitPriceSpecification",
                        price: "9",
                        priceCurrency: "USD",
                        unitText: "MONTH",
                      },
                    },
                  ],
                  provider: {
                    "@id": "https://www.bluemonitor.org/#organization",
                  },
                  featureList: [
                    "Uptime Monitoring",
                    "Heartbeat Push Monitoring",
                    "Discord Webhooks",
                    "Slack Webhooks",
                    "Custom Webhooks",
                    "REST API",
                    "Status Badges",
                    "MCP Server Integration",
                  ],
                },
              ],
            }),
          }}
        />
        <Providers>
          <HeaderWrapper />
          <main className="min-h-screen">{children}</main>
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  );
}
