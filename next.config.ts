import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Next.js configuration for Cloudflare Pages static export
// Force new deployment to main branch
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true
  }
};

export default withNextIntl(nextConfig);
