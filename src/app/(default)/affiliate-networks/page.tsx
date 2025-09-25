import type { Metadata } from "next";
import PageWrapper from "@/components/page-wrapper";
import AffiliateNetworksPage from "@/components/affiliate-networks-page";

export const metadata: Metadata = {
  title: "Affiliate Networks | Affensus - AI-Powered Affiliate Marketing Solutions",
  description: "Explore our comprehensive list of supported affiliate networks. Connect and integrate with major affiliate platforms to maximize your earnings.",
  alternates: {
    canonical: "https://affensus.com/affiliate-networks",
  },
};

export default function AffiliateNetworksPageRoute() {
  return (
    <PageWrapper>
      <AffiliateNetworksPage />
    </PageWrapper>
  );
}
