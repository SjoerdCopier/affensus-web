import type { Metadata } from "next"
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

import ProfilePageComponent from "@/components/dashboard/profile-page"

export const metadata: Metadata = {
  title: "Profile - Affensus",
  description: "Manage your profile, preferences, and account settings.",
  alternates: {
    canonical: "https://affensus.com/dashboard/profile/",
  },
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  
  // Load messages for the specified locale
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    messages = {};
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ProfilePageComponent />
    </NextIntlClientProvider>
  )
}
