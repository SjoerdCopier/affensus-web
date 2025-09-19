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

/**
 * Trims a URL by removing protocol and www prefix, with optional character limit
 * @param url - The URL to trim
 * @param maxLength - Maximum number of characters before adding "..."
 * @returns Trimmed URL string
 */
export function trimUrl(url: string, maxLength?: number): string {
  if (!url) return ''
  
  let trimmed = url
    .replace(/^https?:\/\//, '') // Remove http:// or https://
    .replace(/^www\./, '') // Remove www.
    .replace(/\/$/, '') // Remove trailing forward slash
  
  if (maxLength && trimmed.length > maxLength) {
    trimmed = trimmed.substring(0, maxLength) + '...'
  }
  
  return trimmed
}

/**
 * Ensures a URL has https:// protocol, converting http to https if needed
 * @param url - The URL to ensure has https
 * @returns URL with https:// protocol
 */
export function ensureHttps(url: string): string {
  if (!url) return ''
  
  // If already has https://, return as-is
  if (url.startsWith('https://')) {
    return url
  }
  
  // If has http://, convert to https://
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }
  
  // If no protocol, add https://
  return `https://${url}`
}
