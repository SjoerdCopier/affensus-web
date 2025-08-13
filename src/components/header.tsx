"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useLocaleTranslations } from '../hooks/use-locale-translations';

export default function Header() {
  const { t, currentLocale } = useLocaleTranslations();

  const getLocalizedPath = (path: string) => {
    return currentLocale === 'en' ? path : `/${currentLocale}${path}`;
  };

  return (
    <header className="flex justify-between items-center">
      <div className="flex items-center space-x-8">
        <Link href={getLocalizedPath('/')}>
          <Image
            src="/images/affensus-logo.svg"
            alt="Affensus logo"
            width={200}
            height={70}
            className="cursor-pointer"
            priority
          />
        </Link>
        
        <nav className="hidden md:flex space-x-2.5">
          <Link href={getLocalizedPath('/')} className="group font-medium text-sm leading-none text-gray-700 flex items-center gap-2.5 3xl:h-6 h-8 px-3 rounded-lg bg-transparent hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 ease-in-out relative before:content-[''] before:absolute before:left-[12px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-gray-900 before:rounded-full before:opacity-0 before:scale-0 hover:before:opacity-100 hover:before:scale-100 before:transition-all before:duration-300 pl-[24px]">{t('header.pricing')}</Link>
      
          <div className="relative group">
            <button className="group font-medium text-sm leading-none text-gray-700 flex items-center gap-2.5 3xl:h-6 h-8 px-3 rounded-lg bg-transparent hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 ease-in-out relative before:content-[''] before:absolute before:left-[12px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-gray-900 before:rounded-full before:opacity-0 before:scale-0 hover:before:opacity-100 hover:before:scale-100 before:transition-all before:duration-300 pl-[24px]">
              {t('header.freeTools')}
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" style={{ border: '1px solid #6ca979' }}>
              <div className="p-3">
                <Link href={getLocalizedPath('/tools/affiliate-link-checker')} className="block mb-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{t('header.tools.affiliateLinkChecker.title')}</h3>
                  <p className="text-xs text-gray-600">{t('header.tools.affiliateLinkChecker.description')}</p>
                </Link>
                
                <Link href={getLocalizedPath('/tools/referral-qr-code-generator')} className="block mb-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{t('header.tools.referralQrCodeGenerator.title')}</h3>
                  <p className="text-xs text-gray-600">{t('header.tools.referralQrCodeGenerator.description')}</p>
                </Link>
                
                <Link href={getLocalizedPath('/tools/affiliate-earnings-calculator')} className="block mb-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{t('header.tools.affiliateEarningsCalculator.title')}</h3>
                  <p className="text-xs text-gray-600">{t('header.tools.affiliateEarningsCalculator.description')}</p>
                </Link>
                
              </div>
            </div>
          </div>
          
          <Link href={getLocalizedPath('/auth')} className="group font-medium text-sm leading-none text-gray-700 flex items-center gap-2.5 3xl:h-6 h-8 px-3 rounded-lg bg-transparent hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 ease-in-out relative before:content-[''] before:absolute before:left-[12px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-gray-900 before:rounded-full before:opacity-0 before:scale-0 hover:before:opacity-100 hover:before:scale-100 before:transition-all before:duration-300 pl-[24px]">{t('header.signIn')}</Link>
          <Link href={getLocalizedPath('/auth')} className="group font-medium text-sm leading-none text-gray-700 flex items-center gap-2.5 3xl:h-6 h-8 px-3 rounded-lg bg-transparent hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 ease-in-out relative before:content-[''] before:absolute before:left-[12px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-gray-900 before:rounded-full before:opacity-0 before:scale-0 hover:before:opacity-100 hover:before:scale-100 before:transition-all before:duration-300 pl-[24px]">{t('header.register')}</Link>
          

        </nav>
      </div>
    </header>
  );
}
