"use client"

import { useLocaleTranslations } from '@/hooks/use-locale-translations';
import { locales } from '../locales/settings';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const { currentLocale } = useLocaleTranslations();
  const pathname = usePathname();

  const getLocalizedPath = (locale: string) => {
    if (locale === 'en') {
      // Remove locale prefix if exists
      const pathWithoutLocale = pathname.replace(/^\/(tr-tr)/, '');
      return pathWithoutLocale === '' ? '/' : pathWithoutLocale;
    } else {
      // Add locale prefix
      const pathWithoutLocale = pathname.replace(/^\/(tr-tr)/, '');
      return `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {Object.entries(locales).map(([key, locale]) => (
        <Link
          key={key}
          href={getLocalizedPath(key)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
            currentLocale === key
              ? 'text-white'
              : 'hover:bg-gray-100'
          }`}
          style={{
            backgroundColor: currentLocale === key ? '#6ca979' : 'transparent',
            color: currentLocale === key ? 'white' : '#6ca979',
            borderColor: '#6ca979'
          }}
        >
          <span className="mr-2">{locale.flag}</span>
          {locale.label}
        </Link>
      ))}
    </div>
  );
}
