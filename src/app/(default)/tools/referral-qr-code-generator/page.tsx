import type { Metadata } from "next";
import ReferralQRCodeGenerator from '../../../../components/referral-qr-code-generator';
import PageWrapper from '../../../../components/page-wrapper';

export const metadata: Metadata = {
  title: "Referral QR Code Generator | Create Custom QR Codes | Affensus",
  description: "Free referral QR code generator for affiliate marketers. Create custom QR codes for your referral links to boost conversions and track performance.",
  alternates: {
    canonical: "https://affensus.com/tools/referral-qr-code-generator",
  },
};

export default function ReferralQRCodeGeneratorPage() {
  return (
    <PageWrapper>
      <ReferralQRCodeGenerator />
    </PageWrapper>
  );
}
