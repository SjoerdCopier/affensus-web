import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { DashboardNetworkUptime, DashboardWrapper } from "@/components/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.dashboard.networkUptime");
  
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "https://affensus.com/dashboard/network-uptime",
    },
  };
}

export default function DashboardNetworkUptimePage() {
  return (
    <DashboardWrapper>
      <DashboardNetworkUptime />
    </DashboardWrapper>
  );
}
