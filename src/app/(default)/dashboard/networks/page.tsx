import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { DashboardNetworks, DashboardWrapper } from "@/components/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.dashboard.networks");
  
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "https://affensus.com/dashboard/networks",
    },
  };
}

export default function DashboardNetworksPage() {
  return (
    <DashboardWrapper>
      <DashboardNetworks />
    </DashboardWrapper>
  );
}



