import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HreflangLinks from "@/components/hreflang-links";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Affensus - AI-Powered Affiliate Marketing Solutions | Transform Your Business",
  description: "Transform your affiliate marketing business with Affensus's AI-powered solutions. Advanced tools, analytics, and earnings calculators for modern affiliate marketers.",
  alternates: {
    canonical: "https://affensus.com/",
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <HreflangLinks />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
