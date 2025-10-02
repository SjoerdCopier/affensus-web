import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { DashboardMerchants, DashboardWrapper } from "@/components/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.dashboard.merchants");
  
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "https://affensus.com/dashboard/store-creator",
    },
  };
}

export default function DashboardStoreCreatorPage() {
  return (
    <DashboardWrapper>
      <DashboardMerchants />
    </DashboardWrapper>
  );
}

