import type { Metadata } from "next";
import AffiliateNetworkUptime from "@/components/affiliate-network-uptime";
import { getTranslations } from "next-intl/server";
import { locales } from "@/locales/settings";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return Object.keys(locales).map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params; // Consume params to satisfy Next.js
  const t = await getTranslations("metadata.tools.affiliateNetworkUptime");
  
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
  };
}

export default async function AffiliateNetworkUptimePage({ params }: Props) {
  await params; // Consume params to satisfy Next.js
  return <AffiliateNetworkUptime />;
}
