import type { Metadata } from "next";
import PrivacyPage from "@/components/privacy"
import PageWrapper from "@/components/page-wrapper"

export const metadata: Metadata = {
  title: "Privacy Policy | Affensus - AI-Powered Affiliate Marketing Solutions",
  description: "Learn how Affensus collects, uses, and protects your personal information. GDPR-compliant privacy policy for our affiliate marketing platform.",
  alternates: {
    canonical: "https://affensus.com/privacy",
  },
};

export default function Privacy() {
  return (
    <PageWrapper>
      <PrivacyPage />
    </PageWrapper>
  )
}
