import type { Metadata } from "next";
import { DashboardEditNetwork } from "@/components/dashboard";
import { locales } from "@/locales/settings";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return Object.keys(locales).map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params; // Consume params to satisfy Next.js
  
  return {
    title: "Edit Network - Affensus Dashboard",
    description: "Edit and manage your affiliate network credentials and settings",
  };
}

export default async function DashboardNetworksEditPage({ params }: Props) {
  const { locale } = await params;
  return <DashboardEditNetwork locale={locale} />;
}
