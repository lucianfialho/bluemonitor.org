import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
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
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueMonitor — Real-Time Service Status Monitoring",
    description:
      "Check if your favorite services are down. Real-time status monitoring for hundreds of popular services.",
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
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-0P1450794K');`}
      </Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  );
}
