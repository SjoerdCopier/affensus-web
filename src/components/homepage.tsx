"use client"

import Header from '@/components/header';
import Hero from '@/components/hero';
import AffiliateNetworks from '@/components/affiliate-networks';
import FAQ from '@/components/faq';
import Pricing from '@/components/pricing';
import Footer from '@/components/footer';

export default function Homepage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-2 md:py-8">
        {/* Header with Language Switcher */}
        <Header />

        <Hero />

      </div>
      
      <AffiliateNetworks />
      
      <FAQ />
      
      <Pricing />
      
      <Footer />
    </div>
  );
}
