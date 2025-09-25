import type { Metadata } from "next";
import FraudProtection from "@/components/fraud-protection"
import PageWrapper from "@/components/page-wrapper"

export const metadata: Metadata = {
  title: "Fraud Protection | Affensus - AI-Powered Affiliate Marketing Solutions",
  description: "Advanced fraud detection and prevention for affiliate marketing. Protect your campaigns from fraudulent activities with our comprehensive fraud protection services.",
  alternates: {
    canonical: "https://affensus.com/services/fraud-protection",
  },
};

export default function FraudProtectionPage() {
  return (
    <PageWrapper>
      <FraudProtection />
    </PageWrapper>
  )
}




