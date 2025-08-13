import {getRequestConfig} from 'next-intl/server';
import { locales as localeSettings } from './locales/settings';

export const locales = Object.keys(localeSettings) as Array<keyof typeof localeSettings>;
 
export default getRequestConfig(async ({locale}) => {
  const currentLocale = locale || 'en';
  
  return {
    locale: currentLocale,
    messages: (await import(`./locales/${currentLocale}.json`)).default,
    timeZone: 'UTC'
  };
});
