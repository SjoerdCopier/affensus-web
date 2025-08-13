import type { Metadata } from "next";
import AffiliateLinkChecker from '../../../../../components/affiliate-link-checker';
import PageWrapper from '../../../../../components/page-wrapper';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: "Affiliate Link Checker Tool | Verify Your Affiliate Links | Affensus",
    description: "Free affiliate link checker tool to verify your affiliate links are working correctly. Check redirects, validate URLs, and ensure proper commission tracking.",
    alternates: {
      canonical: `https://affensus.com/${locale}/tools/affiliate-link-checker`,
    },
  };
}

export default function AffiliateLinkCheckerPage() {
  return (
    <PageWrapper>
      <AffiliateLinkChecker />
    </PageWrapper>
  );
}
