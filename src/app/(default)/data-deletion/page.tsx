import type { Metadata } from "next";
import DataDeletionPage from "@/components/data-deletion"
import PageWrapper from "@/components/page-wrapper"

export const metadata: Metadata = {
  title: "Data Deletion Request | Affensus - AI-Powered Affiliate Marketing Solutions",
  description: "Learn how to request deletion of your personal data from Affensus. GDPR-compliant data deletion process for our affiliate marketing platform.",
  alternates: {
    canonical: "https://affensus.com/data-deletion",
  },
};

export default function DataDeletion() {
  return (
    <PageWrapper>
      <DataDeletionPage />
    </PageWrapper>
  )
}
