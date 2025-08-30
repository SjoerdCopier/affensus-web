import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HreflangLinks from "@/components/hreflang-links";

const inter = Inter({
  variable: "--font-inter",
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
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
