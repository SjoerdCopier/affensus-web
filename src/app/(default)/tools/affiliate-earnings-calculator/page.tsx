import type { Metadata } from "next";
import AffiliateEarningsCalculator from '@/components/affiliate-earnings-calculator';
import PageWrapper from '@/components/page-wrapper';

export const metadata: Metadata = {
  title: "Affiliate Earnings Calculator | Calculate Your Potential Income | Affensus",
  description: "Free affiliate earnings calculator to estimate your potential affiliate marketing income. Calculate commissions, conversion rates, and revenue projections.",
  alternates: {
    canonical: "https://affensus.com/tools/affiliate-earnings-calculator",
  },
};

export default function AffiliateEarningsCalculatorPage() {
  return (
    <PageWrapper>
      <AffiliateEarningsCalculator />
    </PageWrapper>
  );
}
