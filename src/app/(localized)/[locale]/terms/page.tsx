import type { Metadata } from "next";
import TermsPage from "@/components/terms"
import PageWrapper from "@/components/page-wrapper"

interface TermsProps {
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
    title: "Terms of Service | Affensus - AI-Powered Affiliate Marketing Solutions",
    description: "Read the terms and conditions for using Affensus affiliate marketing platform. Understand your rights and responsibilities as a user.",
    alternates: {
      canonical: `https://affensus.com/${locale}/terms`,
    },
  };
}

export default async function Terms({ params }: TermsProps) {
  await params
  return (
    <PageWrapper>
      <TermsPage />
    </PageWrapper>
  )
}
