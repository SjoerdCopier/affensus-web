"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useLocaleTranslations } from '@/hooks/use-locale-translations';

export default function Hero() {
  const { t } = useLocaleTranslations();
  return (
    <div className="flex flex-col lg:flex-row items-center gap-12 mb-20 mt-9">
      <div className="flex-1 text-center lg:text-left">
        <div className="flex items-start flex-col justify-end pb-10">
          
          <h1 className="text-gray-900 3xl:text-[56px] md:text-[44px] text-[40px] mb-1.5 leading-none font-semibold md:tracking-[-0.56px] tracking-[-0.4px]">
            {t('homepage.hero.title1')}
          </h1>
          <h1 className="text-gray-900 3xl:text-[56px] md:text-[44px] text-[40px] leading-none font-semibold md:tracking-[-0.56px] tracking-[-0.4px]">
            {t('homepage.hero.title2')}
          </h1>
          
          <p className="md:mt-9 mt-[30px] md:mb-[72px] mb-8 text-gray-600 tracking-[-0.16px] leading-[22.5px] font-normal text-base xl:max-w-[390px] max-w-[632px] w-full">
            {t('homepage.hero.description')}
          </p>
          
          <ul className="flex items-center gap-3 md:gap-3 md:justify-start justify-between w-full">
            <li className="md:flex-none flex-1">
              <Link href="/auth" className="flex items-center justify-center text-white font-medium leading-none text-base rounded-xl bg-green-600 hover:bg-green-700 h-[51px] px-7 transition-all duration-500 ease-in-out w-full">
                {t('homepage.hero.getAffensus')}
              </Link>
            </li>
            <li className="md:flex-none flex-1">
              <Link href="/book-demo" className="flex items-center justify-center text-black font-medium leading-none text-base rounded-xl bg-gray-100 hover:bg-gray-200 h-[51px] px-7 transition-all duration-500 ease-in-out w-full">
                {t('homepage.hero.bookDemo')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center lg:justify-end relative -mt-20">
        <Image
          src="/images/hero-image.webp"
          alt="Hero image"
          width={500}
          height={400}
          className="rounded-2xl shadow-lg"
          priority
        />
        
        {/* Chart Overlay */}
        <div className="absolute 3xl:left-[-66px] xl:left-5 left-[33px] xl:top-[182px] md:top-[194px] top-[229px] max-w-[246px] w-full border border-solid border-gray-300 bg-white rounded-2xl shadow-2xl px-3.5 py-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11.88px] font-medium mb-2.5 tracking-[-0.1188px] leading-none text-gray-700">{t('homepage.hero.affiliateRevenue')}</p>
              <h4 className="flex items-center gap-2.5">
                <span className="font-semibold text-2xl text-black leading-none">{t('homepage.hero.revenueAmount')}</span>
                <span className="font-medium text-[11.18px] leading-none text-green-600 flex items-center gap-1.5">
                  <svg className="h-[15px] w-[15px] text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {t('homepage.hero.revenuePercentage')}
                </span>
              </h4>
            </div>
            <a href="#" className="flex items-center mt-2">
              <svg className="h-1 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="2" cy="2" r="2" />
                <circle cx="10" cy="2" r="2" />
                <circle cx="18" cy="2" r="2" />
              </svg>
            </a>
          </div>
          <div className="overflow-hidden">
            <span className="flex items-center justify-center">
              <Image src="/images/chart-img.png" alt="Chart" width={200} height={100} className="w-full h-auto" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
