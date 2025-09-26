"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useLocaleTranslations } from '../hooks/use-locale-translations';
import { useUser } from '../hooks/use-user';

export default function Header() {
  const { t, currentLocale } = useLocaleTranslations();
  const { user, isLoading } = useUser();

  const getLocalizedPath = (path: string) => {
    return currentLocale === 'en' ? path : `/${currentLocale}${path}`;
  };

  return (
    <header className="flex justify-between items-center relative">
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
        
        {/* Desktop Navigation */}
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
                
                <Link href={getLocalizedPath('/tools/affiliate-network-uptime')} className="block mb-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{t('header.tools.affiliateNetworkUptime.title')}</h3>
                  <p className="text-xs text-gray-600">{t('header.tools.affiliateNetworkUptime.description')}</p>
                </Link>
                
                <Link href={getLocalizedPath('/tools/free-logo-api')} className="block mb-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{t('header.tools.freeLogoApi.title')}</h3>
                  <p className="text-xs text-gray-600">{t('header.tools.freeLogoApi.description')}</p>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative group">
            <button className="group font-medium text-sm leading-none text-gray-700 flex items-center gap-2.5 3xl:h-6 h-8 px-3 rounded-lg bg-transparent hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 ease-in-out relative before:content-[''] before:absolute before:left-[12px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-gray-900 before:rounded-full before:opacity-0 before:scale-0 hover:before:opacity-100 hover:before:scale-100 before:transition-all before:duration-300 pl-[24px]">
              {t('header.services.title')}
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" style={{ border: '1px solid #6ca979' }}>
              <div className="p-3">
                <Link href={getLocalizedPath('/services/fraud-protection')} className="block mb-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{t('header.services.fraudProtection.title')}</h3>
                  <p className="text-xs text-gray-600">{t('header.services.fraudProtection.description')}</p>
                </Link>
              </div>
            </div>
          </div>
          
          {!isLoading && user ? (
            <Link href={getLocalizedPath('/dashboard')} className="group font-medium text-sm leading-none text-gray-700 flex items-center gap-2.5 3xl:h-6 h-8 px-3 rounded-lg bg-transparent hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 ease-in-out relative before:content-[''] before:absolute before:left-[12px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-gray-900 before:rounded-full before:opacity-0 before:scale-0 hover:before:opacity-100 hover:before:scale-100 before:transition-all before:duration-300 pl-[24px]">{t('header.dashboard')}</Link>
          ) : (
            <Link href={getLocalizedPath('/auth')} className="group font-medium text-sm leading-none text-gray-700 flex items-center gap-2.5 3xl:h-6 h-8 px-3 rounded-lg bg-transparent hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 ease-in-out relative before:content-[''] before:absolute before:left-[12px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-gray-900 before:rounded-full before:opacity-0 before:scale-0 hover:before:opacity-100 hover:before:scale-100 before:transition-all before:duration-300 pl-[24px]">{t('header.signIn')}</Link>
          )}
        </nav>
      </div>

      {/* Mobile Burger Menu Button */}
      <div className="md:hidden">
        <label htmlFor="mobile-menu-toggle" className="cursor-pointer p-2">
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className="w-6 h-0.5 bg-gray-700 transition-all duration-300 ease-in-out transform origin-center"></span>
            <span className="w-6 h-0.5 bg-gray-700 transition-all duration-300 ease-in-out transform origin-center mt-1"></span>
            <span className="w-6 h-0.5 bg-gray-700 transition-all duration-300 ease-in-out transform origin-center mt-1"></span>
          </div>
        </label>
        
        {/* Hidden checkbox for CSS-only toggle */}
        <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />
        
        {/* Mobile Menu Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 opacity-0 invisible peer-checked:opacity-100 peer-checked:visible transition-all duration-300 ease-in-out">
          <label htmlFor="mobile-menu-toggle" className="absolute inset-0 cursor-pointer"></label>
        </div>
        
        {/* Mobile Menu Panel */}
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform translate-x-full peer-checked:translate-x-0 transition-transform duration-300 ease-in-out">
          <div className="p-6">
            {/* Close button */}
            <div className="flex justify-end mb-6">
              <label htmlFor="mobile-menu-toggle" className="cursor-pointer p-2">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </label>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="space-y-4">
              <Link 
                href={getLocalizedPath('/')} 
                className="block font-medium text-lg text-gray-700 hover:text-gray-900 transition-colors"
              >
                {t('header.pricing')}
              </Link>
              
              <div className="space-y-2">
                <div className="font-medium text-lg text-gray-700">{t('header.freeTools')}</div>
                <div className="pl-4 space-y-2">
                  <Link 
                    href={getLocalizedPath('/tools/affiliate-link-checker')} 
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('header.tools.affiliateLinkChecker.title')}
                  </Link>
                  <Link 
                    href={getLocalizedPath('/tools/referral-qr-code-generator')} 
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('header.tools.referralQrCodeGenerator.title')}
                  </Link>
                  <Link 
                    href={getLocalizedPath('/tools/affiliate-earnings-calculator')} 
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('header.tools.affiliateEarningsCalculator.title')}
                  </Link>
                  <Link 
                    href={getLocalizedPath('/tools/affiliate-network-uptime')} 
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('header.tools.affiliateNetworkUptime.title')}
                  </Link>
                  <Link 
                    href={getLocalizedPath('/tools/free-logo-api')} 
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('header.tools.freeLogoApi.title')}
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium text-lg text-gray-700">{t('header.services.title')}</div>
                <div className="pl-4 space-y-2">
                  <Link 
                    href={getLocalizedPath('/services/fraud-protection')} 
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('header.services.fraudProtection.title')}
                  </Link>
                </div>
              </div>
              
              {!isLoading && user ? (
                <Link 
                  href={getLocalizedPath('/dashboard')} 
                  className="block font-medium text-lg text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {t('header.dashboard')}
                </Link>
              ) : (
                <Link 
                  href={getLocalizedPath('/auth')} 
                  className="block font-medium text-lg text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {t('header.signIn')}
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
