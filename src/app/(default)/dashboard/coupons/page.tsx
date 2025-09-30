import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { DashboardCoupons, DashboardWrapper } from "@/components/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.dashboard.coupons");
  
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "https://affensus.com/dashboard/coupons",
    },
  };
}

export default function DashboardCouponsPage() {
  return (
    <DashboardWrapper>
      <DashboardCoupons />
    </DashboardWrapper>
  );
}




