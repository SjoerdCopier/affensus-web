import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getMessages } from 'next-intl/server';
import "../../../app/(default)/globals.css";
import { locales } from "../../../locales/settings";
import HreflangLinks from "@/components/hreflang-links";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

interface Messages {
  metadata?: {
    homepage?: {
      title?: string;
      description?: string;
    };
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale }) as Messages;
  
  return {
    title: messages.metadata?.homepage?.title || "Affensus - AI-Powered Affiliate Marketing Solutions | Transform Your Business",
    description: messages.metadata?.homepage?.description || "Transform your affiliate marketing business with Affensus's AI-powered solutions. Advanced tools, analytics, and earnings calculators for modern affiliate marketers.",
    alternates: {
      canonical: `https://affensus.com/${locale}/`,
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(locales).filter(locale => locale !== 'en').map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: urlLocale } = await params;
  const properLocale = locales[urlLocale as keyof typeof locales]?.locale || urlLocale;
  
  return (
    <html lang={properLocale}>
      <head>
        <HreflangLinks />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
