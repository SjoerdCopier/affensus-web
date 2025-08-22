import type { Metadata } from "next";
import DataDeletionPage from "@/components/data-deletion"
import PageWrapper from "@/components/page-wrapper"

interface DataDeletionProps {
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
    title: "Data Deletion Request | Affensus - AI-Powered Affiliate Marketing Solutions",
    description: "Learn how to request deletion of your personal data from Affensus. GDPR-compliant data deletion process for our affiliate marketing platform.",
    alternates: {
      canonical: `https://affensus.com/${locale}/data-deletion`,
    },
  };
}

export default async function DataDeletion({ params }: DataDeletionProps) {
  await params
  return (
    <PageWrapper>
      <DataDeletionPage />
    </PageWrapper>
  )
}
