import type { Metadata } from "next";
import AffiliateNetworkUptime from "@/components/affiliate-network-uptime";

export const metadata: Metadata = {
  title: "Affiliate Network Uptime Monitor | Real-time Status Tracking",
  description: "Monitor affiliate network uptime in real-time. Track homepage, API, and tracking URL status across major affiliate networks. Get instant alerts for downtime.",
  keywords: "affiliate network uptime, network monitoring, affiliate tracking, uptime monitor, affiliate network status",
};

export default function AffiliateNetworkUptimePage() {
  return <AffiliateNetworkUptime />;
}
