import type { Metadata } from "next";
import { DashboardEditNetwork, DashboardWrapper } from "@/components/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Edit Network - Affensus Dashboard",
    description: "Edit and manage your affiliate network credentials and settings",
    alternates: {
      canonical: "https://affensus.com/dashboard/networks/edit",
    },
  };
}

export default function DashboardNetworksEditPage() {
  return (
    <DashboardWrapper>
      <DashboardEditNetwork />
    </DashboardWrapper>
  );
}
