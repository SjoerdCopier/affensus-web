"use client"

import { useLocaleTranslations } from '@/hooks/use-locale-translations';
import Image from 'next/image';
import Link from 'next/link';
import { locales } from '@/locales/settings';

export default function Footer() {
  const { currentLocale } = useLocaleTranslations();

  return (
    <footer className="bg-[#274539] text-white py-12 mt-20 mx-4 mb-4 rounded-3xl">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <Image
              src="/images/affensus-white.svg"
              alt="Affensus logo"
              width={150}
              height={52}
              className="mb-4"
              priority
            />
            <p className="text-white mb-4">
              Say goodbye to juggling multiple tools and focus on what truly matters,<br /> growing your affiliate success.
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com/sjoerdcopier" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">X</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/sjoerd-copier-05280114/" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-white inline-flex items-center text-sm font-medium leading-none border-b border-dotted border-white/[0.5] pb-1 hover:text-gray-300 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/refund-policy" className="text-white inline-flex items-center text-sm font-medium leading-none border-b border-dotted border-white/[0.5] pb-1 hover:text-gray-300 transition-colors">Refund Policy</Link></li>
              <li><Link href="/data-deletion" className="text-white inline-flex items-center text-sm font-medium leading-none border-b border-dotted border-white/[0.5] pb-1 hover:text-gray-300 transition-colors">Data Deletion</Link></li>
              <li><Link href="/privacy" className="text-white inline-flex items-center text-sm font-medium leading-none border-b border-dotted border-white/[0.5] pb-1 hover:text-gray-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-white inline-flex items-center text-sm font-medium leading-none border-b border-dotted border-white/[0.5] pb-1 hover:text-gray-300 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Affensus. All rights reserved.
          </p>
          
          {/* Language Selector */}
          <div className="relative mt-2 md:mt-0 group">
            <button className="bg-white text-[#6ca979] px-3 py-2 rounded-md text-sm border border-white focus:outline-none focus:ring-2 focus:ring-[#6ca979] flex items-center space-x-2 hover:bg-[#6ca979] hover:text-white transition-colors duration-200">
              <span>{locales[currentLocale as keyof typeof locales]?.flag}</span>
              <span>{locales[currentLocale as keyof typeof locales]?.label}</span>
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10" style={{ border: '1px solid #6ca979' }}>
              {Object.entries(locales).map(([key, locale]) => (
                <Link 
                  key={key} 
                  href={key === 'en' ? '/' : `/${key}`}
                  className={`block px-4 py-2 text-sm transition-colors ${
                    currentLocale === key ? 'text-white bg-[#6ca979] font-medium' : 'text-[#6ca979] hover:bg-[#6ca979] hover:text-white'
                  }`}
                >
                  <span className="mr-2">{locale.flag}</span>
                  {locale.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
