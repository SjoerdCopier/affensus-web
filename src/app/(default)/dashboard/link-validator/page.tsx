import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { DashboardLinkValidator, DashboardWrapper } from "@/components/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.dashboard.linkValidator");
  
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "https://affensus.com/dashboard/link-validator",
    },
  };
}

export default function DashboardLinkValidatorPage() {
  return (
    <DashboardWrapper>
      <DashboardLinkValidator />
    </DashboardWrapper>
  );
}


