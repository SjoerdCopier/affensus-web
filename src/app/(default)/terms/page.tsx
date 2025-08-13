import type { Metadata } from "next";
import TermsPage from "@/components/terms"
import PageWrapper from "@/components/page-wrapper"

export const metadata: Metadata = {
  title: "Terms of Service | Affensus - AI-Powered Affiliate Marketing Solutions",
  description: "Read the terms and conditions for using Affensus affiliate marketing platform. Understand your rights and responsibilities as a user.",
  alternates: {
    canonical: "https://affensus.com/terms",
  },
};

export default function Terms() {
  return (
    <PageWrapper>
      <TermsPage />
    </PageWrapper>
  )
}
