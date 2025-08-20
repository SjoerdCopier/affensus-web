import type { Metadata } from "next"
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Suspense } from "react"
import { notFound } from 'next/navigation';
import { locales } from '../../../../locales/settings';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import DashboardWrapper from "@/components/dashboard/dashboard-wrapper"


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  const localeSettings = locales[locale as keyof typeof locales];
  const canonicalUrl = localeSettings?.canonicalBase ? `${localeSettings.canonicalBase}dashboard/` : `https://morsexpress.com/${locale}/dashboard/`;

  return {
    title: "Dashboard - Affensus",
    description: "Access your personalized dashboard. Manage your account, view analytics, and access powerful tools.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export async function generateStaticParams() {
  // Generate static params for all supported non-English locales
  return Object.keys(locales).filter(locale => locale !== 'en').map((locale) => ({
    locale,
  }));
}

interface DashboardPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;

  // Validate locale
  if (!Object.keys(locales).includes(locale) || locale === 'en') {
    notFound();
  }

  // Load messages for the locale
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    notFound();
  }



  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <CardTitle className="text-2xl">Loading...</CardTitle>
            <CardDescription>
              Please wait while we load your dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <DashboardWrapper locale={locale} />
      </NextIntlClientProvider>
    </Suspense>
  );
} 