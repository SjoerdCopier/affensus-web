import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { DashboardLogos, DashboardWrapper } from "@/components/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.dashboard.logos");
  
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "https://affensus.com/dashboard/logos",
    },
  };
}

export default function DashboardLogosPage() {
  return (
    <DashboardWrapper>
      <DashboardLogos />
    </DashboardWrapper>
  );
}
