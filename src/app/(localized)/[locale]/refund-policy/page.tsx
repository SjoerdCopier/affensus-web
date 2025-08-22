import type { Metadata } from "next";
import RefundPolicyPage from "@/components/refund-policy"
import PageWrapper from "@/components/page-wrapper"

interface RefundPolicyProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: "Refund Policy | Affensus - AI-Powered Affiliate Marketing Solutions",
    description: "Learn about our refund policy and how to request a refund. We offer a 7-day money-back guarantee with no questions asked.",
    alternates: {
      canonical: `https://affensus.com/${locale}/refund-policy`,
    },
  };
}

export default async function RefundPolicy({ params }: RefundPolicyProps) {
  await params
  return (
    <PageWrapper>
      <RefundPolicyPage />
    </PageWrapper>
  )
}
