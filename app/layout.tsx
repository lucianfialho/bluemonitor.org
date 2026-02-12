import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
