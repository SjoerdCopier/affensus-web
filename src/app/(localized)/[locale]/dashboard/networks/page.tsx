import type { Metadata } from "next";
import { DashboardNetworks, DashboardWrapper } from "@/components/dashboard";
import { getTranslations } from "next-intl/server";
import { locales } from "@/locales/settings";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return Object.keys(locales).map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params; // Consume params to satisfy Next.js
  const t = await getTranslations("metadata.dashboard.networks");
  
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function DashboardNetworksPage({ params }: Props) {
  const { locale } = await params;
  
  // Load messages for the locale
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    messages = {};
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <DashboardWrapper locale={locale}>
        <DashboardNetworks locale={locale} />
      </DashboardWrapper>
    </NextIntlClientProvider>
  );
}



