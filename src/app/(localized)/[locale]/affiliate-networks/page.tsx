import type { Metadata } from "next";
import { getMessages } from 'next-intl/server';
import PageWrapper from "@/components/page-wrapper";
import AffiliateNetworksPage from "@/components/affiliate-networks-page";

interface Messages {
  metadata?: {
    affiliateNetworks?: {
      title?: string;
      description?: string;
    };
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale }) as Messages;
  
  return {
    title: messages.metadata?.affiliateNetworks?.title || "Affiliate Networks | Affensus - AI-Powered Affiliate Marketing Solutions",
    description: messages.metadata?.affiliateNetworks?.description || "Explore our comprehensive list of supported affiliate networks. Connect and integrate with major affiliate platforms to maximize your earnings.",
    alternates: {
      canonical: `https://affensus.com/${locale}/affiliate-networks`,
    },
  };
}

export default function AffiliateNetworksPageRoute() {
  return (
    <PageWrapper>
      <AffiliateNetworksPage />
    </PageWrapper>
  );
}
