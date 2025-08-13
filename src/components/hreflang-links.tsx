"use client"

import { usePathname } from 'next/navigation';
import { locales } from '../locales/settings';

interface LocaleConfig {
  canonicalBase: string;
  hreflang: string;
}

export default function HreflangLinks() {
  const pathname = usePathname();
  
  const getBasePath = () => {
    for (const [localeKey] of Object.entries(locales)) {
      if (localeKey !== 'en' && pathname.startsWith(`/${localeKey}/`)) {
        return pathname.replace(`/${localeKey}`, '');
      }
    }
    return pathname;
  };
  
  const basePath = getBasePath();
  
  const getLocaleUrl = (localeKey: string, locale: LocaleConfig) => {
    const baseUrl = 'https://affensus.com';
    
    let url: string;
    
    if (localeKey === 'en') {
      if (basePath === '/' || basePath === '') {
        url = baseUrl;
      } else {
        url = `${baseUrl}${basePath}`;
      }
    } else {
      const localePath = locale.canonicalBase.replace(/^https?:\/\/[^\/]+/, '').replace(/\/$/, '');
      const fullPath = `${localePath}${basePath}`;
      url = `${baseUrl}${fullPath}`;
    }
    
    if (url !== baseUrl && !url.endsWith('/')) {
      url += '/';
    }
    
    return url;
  };

  return (
    <>
      <link rel="alternate" hrefLang="x-default" href={getLocaleUrl('en', locales.en)} />
      {Object.entries(locales).map(([key, locale]) => (
        <link
          key={key}
          rel="alternate"
          hrefLang={locale.hreflang}
          href={getLocaleUrl(key, locale)}
        />
      ))}
    </>
  );
}
