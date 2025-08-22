import type { Metadata } from "next";
import RefundPolicyPage from "@/components/refund-policy"
import PageWrapper from "@/components/page-wrapper"

export const metadata: Metadata = {
  title: "Refund Policy | Affensus - AI-Powered Affiliate Marketing Solutions",
  description: "Learn about our refund policy and how to request a refund. We offer a 7-day money-back guarantee with no questions asked.",
  alternates: {
    canonical: "https://affensus.com/refund-policy",
  },
};

export default function RefundPolicy() {
  return (
    <PageWrapper>
      <RefundPolicyPage />
    </PageWrapper>
  )
}
