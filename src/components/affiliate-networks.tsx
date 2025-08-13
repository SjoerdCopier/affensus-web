'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLocaleTranslations } from '@/hooks/use-locale-translations';

interface LogoItem {
  name: string;
  filename: string;
  subtitle?: string;
}

const logoItems: LogoItem[] = [
  { name: 'SKIMLINKS', filename: 'logo-skimlinks.png', subtitle: 'a Taboola company' },
  { name: 'smart response', filename: 'logo-smartresponse.png' },
  { name: 'sourceknowledge', filename: 'logo-sourceknowledge.png', subtitle: 'a mrge company' },
  { name: 'Tradedoubler', filename: 'logo-tradedoubler.png' },
  { name: 'WEBGAINS', filename: 'logo-webgains.png' },
  { name: 'YADORE', filename: 'logo-yadore.png', subtitle: 'we love conversions' },
  { name: 'SALESTRING', filename: 'logo-salestring.png' },
  { name: 'Commissionfactory', filename: 'logo-commissionfactory.png', subtitle: 'Part of Awin' },
  { name: 'TAKEADS', filename: 'logo-takeads.png' },
  { name: 'Rakuten Advertising', filename: 'logo-rakuten.png' },
  { name: 'glopss', filename: 'logo-glopss.png' },
  { name: 'indoleads', filename: 'logo-indoleads.png' },
  { name: 'mise', filename: 'logo-mcanism.png' },
  { name: 'addrevenue.io', filename: 'logo-addrevenue.png' },
  { name: 'adrecord', filename: 'logo-adrecord.png' },
  { name: 'Ad service', filename: 'logo-adservice.png' },
  { name: 'ADTRACTION', filename: 'logo-adtraction.png' },
  { name: 'AWIN', filename: 'logo-awin.png' },
  { name: 'belboon', filename: 'logo-belboon.png', subtitle: 'part of detailM' },
  { name: 'CJ', filename: 'logo-cj.png' },
  { name: 'FlexOffers', filename: 'logo-flexoffers.png' },
  { name: 'Impact', filename: 'logo-impact.png' },
  { name: 'InvolveAsia', filename: 'logo-involveasia.png' },
  { name: 'LinkBux', filename: 'logo-linkbux.png' },
  { name: 'Kelkoo', filename: 'logo-kelkoo.png' },
  { name: 'Affilae', filename: 'logo-affilae.png' },
  { name: 'Admitad', filename: 'logo-admitad.png' },
  { name: 'AccessTrade', filename: 'logo-accesstrade.png' },
  { name: 'Daisycon', filename: 'logo-daisycon.png' },
  { name: 'Digidip', filename: 'logo-digidip.png' },
  { name: 'Effiliation', filename: 'logo-effiliation.png' },
  { name: 'Cuelinks', filename: 'logo-cuelinks.png' },
  { name: 'Circlewise', filename: 'logo-circlewise.png' },
  { name: 'BrandReward', filename: 'logo-brandreward.png' },
  { name: 'Chinesean', filename: 'logo-chinesean.png' },
  { name: 'Kwanko', filename: 'logo-kwanko.png' },
  { name: 'Partner Ads', filename: 'logo-partner-ads.png' },
  { name: 'PartnerBoost', filename: 'logo-partnerboost.png' },
  { name: 'Partnerize', filename: 'logo-partnerize.png' },
  { name: 'RetailAds', filename: 'logo-retailads.png' },
  { name: 'ShareASale', filename: 'logo-shareasale.png' },
  { name: 'TimeOne', filename: 'logo-timeone.png' },
  { name: 'TradeTracker', filename: 'logo-tradetracker.png' },
  { name: 'YieldKit', filename: 'logo-yieldkit.png' },
];

export default function AffiliateNetworks() {
  const { t } = useLocaleTranslations();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('affiliate-networks');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Create exactly 3 rows with enough logos to fill the entire screen width
  const createContinuousRow = (logos: LogoItem[]) => {
    // Duplicate the logos multiple times to ensure the entire screen is filled
    // Each logo box is w-64 (256px) + gap-4 (16px) = 272px per logo
    // For a typical screen width of 1920px, we need at least 8 logos visible
    // So we'll duplicate the logos 6 times to ensure continuous scrolling
    return [...logos, ...logos, ...logos, ...logos, ...logos, ...logos];
  };

  const rows = [
    createContinuousRow(logoItems.slice(0, 14)),
    createContinuousRow(logoItems.slice(14, 28)),
    createContinuousRow(logoItems.slice(28, 42))
  ];

  return (
    <section id="affiliate-networks" className="py-16 mb-16 bg-gray-50 w-full">
      <div className="w-full px-4">
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('homepage.affiliateNetworks.title')}
          </h2>
          <p className="text-base text-gray-600 tracking-[-0.16px] leading-[22.5px] font-normal max-w-3xl mx-auto">
            {t('homepage.affiliateNetworks.description')}
          </p>
        </div>

        <div className="space-y-4 w-full relative">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="w-full overflow-hidden relative">
              {/* Left fade overlay */}
              <div className="absolute left-0 top-0 w-32 h-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
              
              {/* Right fade overlay */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
              
              <div
                className={`flex gap-4 ${
                  rowIndex % 2 === 0 ? 'animate-scroll-left' : 'animate-scroll-right'
                }`}
                style={{
                  width: 'max-content',
                  minWidth: '100vw'
                }}
              >
                {row.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`flex-shrink-0 w-64 h-32 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center justify-center transition-all duration-300 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{
                      animationDelay: `${itemIndex * 100}ms`,
                      transitionDelay: `${itemIndex * 50}ms`,
                    }}
                  >
                    <div className="relative w-24 h-24">
                      <Image
                        src={`/images/logos/${item.filename}`}
                        alt={item.name}
                        fill
                        className="object-contain"
                        sizes="96px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
