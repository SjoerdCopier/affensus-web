export function getLocalizedPath(locale: string, path: string): string {
  // For default locale (English), don't add locale prefix
  if (locale === 'en') {
    return path
  }
  
  // For other locales, add the locale prefix
  return `/${locale}${path}`
}
