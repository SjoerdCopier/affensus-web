import type { Metadata } from "next";
import AffiliateEarningsCalculator from '@/components/affiliate-earnings-calculator';
import PageWrapper from '@/components/page-wrapper';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: "Affiliate Earnings Calculator | Calculate Your Potential Income | Affensus",
    description: "Free affiliate earnings calculator to estimate your potential affiliate marketing income. Calculate commissions, conversion rates, and revenue projections.",
    alternates: {
      canonical: `https://affensus.com/${locale}/tools/affiliate-earnings-calculator`,
    },
  };
}

export default function AffiliateEarningsCalculatorPage() {
  return (
    <PageWrapper>
      <AffiliateEarningsCalculator />
    </PageWrapper>
  );
}
