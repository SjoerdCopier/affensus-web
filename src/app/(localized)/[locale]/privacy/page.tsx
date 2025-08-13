import type { Metadata } from "next";
import PrivacyPage from "@/components/privacy"
import PageWrapper from "@/components/page-wrapper"

interface PrivacyProps {
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
    title: "Privacy Policy | Affensus - AI-Powered Affiliate Marketing Solutions",
    description: "Learn how Affensus collects, uses, and protects your personal information. GDPR-compliant privacy policy for our affiliate marketing platform.",
    alternates: {
      canonical: `https://affensus.com/${locale}/privacy`,
    },
  };
}

export default async function Privacy({ params }: PrivacyProps) {
  await params
  return (
    <PageWrapper>
      <PrivacyPage />
    </PageWrapper>
  )
}
