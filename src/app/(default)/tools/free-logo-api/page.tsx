import type { Metadata } from "next";
import FreeLogoApi from '../../../../components/free-logo-api';
import PageWrapper from '../../../../components/page-wrapper';

export const metadata: Metadata = {
  title: "Free Logo API Tool | Extract Website Logos | Affensus",
  description: "Free logo extraction tool to get high-quality logos from any website. Extract logos in multiple formats (PNG, JPG, WebP) with customizable dimensions.",
  alternates: {
    canonical: "https://affensus.com/tools/free-logo-api",
  },
};

export default function FreeLogoApiPage() {
  return (
    <PageWrapper>
      <FreeLogoApi />
    </PageWrapper>
  );
}
