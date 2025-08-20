export function getLocalizedPath(locale: string, path: string): string {
  // For default locale (English), don't add locale prefix
  if (locale === 'en') {
    return path
  }
  
  // For other locales, add the locale prefix
  return `/${locale}${path}`
}

export function createFullUrl(baseUrl: string, path: string): string {
  // Remove trailing slash from baseUrl and leading slash from path to avoid double slashes
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  
  return `${cleanBaseUrl}/${cleanPath}`
}

export function joinUrlPaths(...paths: string[]): string {
  return paths
    .map(path => path.replace(/^\/+|\/+$/g, '')) // Remove leading and trailing slashes
    .filter(path => path.length > 0) // Remove empty paths
    .join('/')
}
