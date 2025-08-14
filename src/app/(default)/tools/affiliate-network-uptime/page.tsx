import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import AffiliateNetworkUptime from "@/components/affiliate-network-uptime";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.tools.affiliateNetworkUptime");
  
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "https://affensus.com/tools/affiliate-network-uptime",
    },
  };
}

export default function AffiliateNetworkUptimePage() {
  return <AffiliateNetworkUptime />;
}
