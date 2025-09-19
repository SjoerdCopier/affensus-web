import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { DashboardLinkRot, DashboardWrapper } from "@/components/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.dashboard.linkRot");
  
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "https://affensus.com/dashboard/link-rot",
    },
  };
}

export default function DashboardLinkRotPage() {
  return (
    <DashboardWrapper>
      <DashboardLinkRot />
    </DashboardWrapper>
  );
}

