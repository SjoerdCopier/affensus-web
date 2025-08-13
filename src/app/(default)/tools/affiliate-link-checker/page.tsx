import type { Metadata } from "next";
import AffiliateLinkChecker from '../../../../components/affiliate-link-checker';
import PageWrapper from '../../../../components/page-wrapper';

export const metadata: Metadata = {
  title: "Affiliate Link Checker Tool | Verify Your Affiliate Links | Affensus",
  description: "Free affiliate link checker tool to verify your affiliate links are working correctly. Check redirects, validate URLs, and ensure proper commission tracking.",
  alternates: {
    canonical: "https://affensus.com/tools/affiliate-link-checker",
  },
};

export default function AffiliateLinkCheckerPage() {
  return (
    <PageWrapper>
      <AffiliateLinkChecker />
    </PageWrapper>
  );
}
