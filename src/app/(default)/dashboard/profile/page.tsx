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

export default async function ProfilePage() {
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
      <ProfilePageComponent />
    </NextIntlClientProvider>
  )
}
