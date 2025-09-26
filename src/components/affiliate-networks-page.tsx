"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, Network, Zap, TrendingUp } from 'lucide-react';
import Breadcrumbs from "@/components/breadcrumbs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

// Generate affiliate networks from logo filenames
const affiliateNetworks = [
  { id: 'accesstrade', name: 'AccessTrade', logo: '/images/logos/logo-accesstrade.png' },
  { id: 'addrevenue', name: 'AddRevenue', logo: '/images/logos/logo-addrevenue.png' },
  { id: 'admitad', name: 'Admitad', logo: '/images/logos/logo-admitad.png' },
  { id: 'adrecord', name: 'Adrecord', logo: '/images/logos/logo-adrecord.png' },
  { id: 'adservice', name: 'Adservice', logo: '/images/logos/logo-adservice.png' },
  { id: 'adtraction', name: 'Adtraction', logo: '/images/logos/logo-adtraction.png' },
  { id: 'affilae', name: 'Affilae', logo: '/images/logos/logo-affilae.png' },
  { id: 'awin', name: 'Awin', logo: '/images/logos/logo-awin.png' },
  { id: 'belboon', name: 'Belboon', logo: '/images/logos/logo-belboon.png' },
  { id: 'brandreward', name: 'BrandReward', logo: '/images/logos/logo-brandreward.png' },
  { id: 'chinesean', name: 'ChineseAN', logo: '/images/logos/logo-chinesean.png' },
  { id: 'circlewise', name: 'CircleWise', logo: '/images/logos/logo-circlewise.png' },
  { id: 'cj', name: 'CJ Affiliate', logo: '/images/logos/logo-cj.png' },
  { id: 'commissionfactory', name: 'Commission Factory', logo: '/images/logos/logo-commissionfactory.png' },
  { id: 'cuelinks', name: 'CueLinks', logo: '/images/logos/logo-cuelinks.png' },
  { id: 'daisycon', name: 'Daisycon', logo: '/images/logos/logo-daisycon.png' },
  { id: 'digidip', name: 'Digidip', logo: '/images/logos/logo-digidip.png' },
  { id: 'effiliation', name: 'Effiliation', logo: '/images/logos/logo-effiliation.png' },
  { id: 'flexoffers', name: 'FlexOffers', logo: '/images/logos/logo-flexoffers.png' },
  { id: 'glopss', name: 'Glopss', logo: '/images/logos/logo-glopss.png' },
  { id: 'impact', name: 'Impact', logo: '/images/logos/logo-impact.png' },
  { id: 'indoleads', name: 'IndoLeads', logo: '/images/logos/logo-indoleads.png' },
  { id: 'involveasia', name: 'Involve Asia', logo: '/images/logos/logo-involveasia.png' },
  { id: 'kelkoo', name: 'Kelkoo', logo: '/images/logos/logo-kelkoo.png' },
  { id: 'kwanko', name: 'Kwanko', logo: '/images/logos/logo-kwanko.png' },
  { id: 'linkbux', name: 'LinkBux', logo: '/images/logos/logo-linkbux.png' },
  { id: 'mcanism', name: 'MCanism', logo: '/images/logos/logo-mcanism.png' },
  { id: 'optimise', name: 'Optimise', logo: '/images/logos/logo-optimise.png' },
  { id: 'partner-ads', name: 'Partner-Ads', logo: '/images/logos/logo-partner-ads.png' },
  { id: 'partnerboost', name: 'PartnerBoost', logo: '/images/logos/logo-partnerboost.png' },
  { id: 'partnerize', name: 'Partnerize', logo: '/images/logos/logo-partnerize.png' },
  { id: 'rakuten', name: 'Rakuten', logo: '/images/logos/logo-rakuten.png' },
  { id: 'retailads', name: 'RetailAds', logo: '/images/logos/logo-retailads.png' },
  { id: 'salestring', name: 'SaleString', logo: '/images/logos/logo-salestring.png' },
  { id: 'shareasale', name: 'ShareASale', logo: '/images/logos/logo-shareasale.png' },
  { id: 'skimlinks', name: 'Skimlinks', logo: '/images/logos/logo-skimlinks.png' },
  { id: 'smartresponse', name: 'Smart Response', logo: '/images/logos/logo-smartresponse.png' },
  { id: 'sourceknowledge', name: 'SourceKnowledge', logo: '/images/logos/logo-sourceknowledge.png' },
  { id: 'takeads', name: 'TakeAds', logo: '/images/logos/logo-takeads.png' },
  { id: 'timeone', name: 'TimeOne', logo: '/images/logos/logo-timeone.png' },
  { id: 'tradedoubler', name: 'TradeDoubler', logo: '/images/logos/logo-tradedoubler.png' },
  { id: 'tradetracker', name: 'TradeTracker', logo: '/images/logos/logo-tradetracker.png' },
  { id: 'webgains', name: 'Webgains', logo: '/images/logos/logo-webgains.png' },
  { id: 'yadore', name: 'Yadore', logo: '/images/logos/logo-yadore.png' },
  { id: 'yieldkit', name: 'YieldKit', logo: '/images/logos/logo-yieldkit.png' },
];

export default function AffiliateNetworksPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNetworks = useMemo(() => {
    if (!searchTerm) return affiliateNetworks;
    return affiliateNetworks.filter(network =>
      network.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="container mx-auto px-4 pt-4 pb-16 space-y-12">
      {/* Breadcrumbs */}
      <div>
        <Breadcrumbs
          items={[
            {
              label: "Affiliate Networks",
              href: "/affiliate-networks",
              current: true,
            },
          ]}
        />
      </div>
      
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-800">
            Affiliate Networks
          </h1>
          <p className="max-w-5xl mx-auto text-sm opacity-90 leading-relaxed mb-6 text-black">
            Explore our comprehensive list of supported affiliate networks. Connect and integrate with major affiliate platforms to maximize your earnings.
            <br />
            We support integration with all major affiliate networks through API connections.
          </p>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 my-12">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 rounded-full bg-green-600">
                <Network className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">45+ Networks</h3>
              <p className="text-sm text-muted-foreground">Connect with all major affiliate networks in one place</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 rounded-full bg-green-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">Easy Integration</h3>
              <p className="text-sm text-muted-foreground">Simple API and postback URL connections</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 rounded-full bg-green-600">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">Maximize Earnings</h3>
              <p className="text-sm text-muted-foreground">Track campaigns across all networks</p>
            </div>
          </div>

          {/* Login/Register Button */}
          <div className="mb-8">
            <Link href="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Get Started with Affensus
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search networks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md mx-auto border-gray-300 px-3 py-2 text-sm h-auto"
            />
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <p className="mt-4 text-sm text-gray-500">
              Showing {filteredNetworks.length} networks matching &apos;{searchTerm}&apos;
            </p>
          )}

          {/* Networks Grid */}
          <div className="mt-8">
            {filteredNetworks.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No networks found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse all networks below.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {filteredNetworks.map((network) => (
                  <div
                    key={network.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-3 sm:p-4 md:p-6 flex flex-col items-center text-center group border border-gray-100"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-32 md:h-32 lg:w-36 lg:h-36 mb-2 sm:mb-3 md:mb-4 relative flex items-center justify-center">
                      <Image
                        src={network.logo}
                        alt={`${network.name} logo`}
                        width={144}
                        height={144}
                        className="object-contain max-w-full max-h-full group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">
                      {network.name}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}