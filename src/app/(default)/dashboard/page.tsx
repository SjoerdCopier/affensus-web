import type { Metadata } from "next"
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

import DashboardWrapper from "@/components/dashboard/dashboard-wrapper"


export const metadata: Metadata = {
  title: "Dashboard - Affensus",
  description: "Access your personalized dashboard. Manage your account, view analytics, and access powerful tools.",
  alternates: {
    canonical: "https://affensus.com/dashboard/",
  },
}

export default async function DashboardPage() {
  // Load messages for the default locale (en)
  let messages;
  try {
    messages = await getMessages({ locale: 'en' });
  } catch (error) {
    console.error('Failed to load messages for locale en:', error);
    messages = {};
  }

  return (
    <NextIntlClientProvider messages={messages} locale="en">
      <DashboardWrapper locale="en" />
    </NextIntlClientProvider>
  )
} 