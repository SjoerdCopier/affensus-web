import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { DashboardNotifications, DashboardWrapper } from "@/components/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.dashboard.notifications");
  
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "https://affensus.com/dashboard/notifications",
    },
  };
}

export default function DashboardNotificationsPage() {
  return (
    <DashboardWrapper>
      <DashboardNotifications />
    </DashboardWrapper>
  );
}
