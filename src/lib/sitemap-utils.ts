import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

import { createFullUrl, joinUrlPaths } from './url-utils'

export interface CategoryData {
  categorySlug: string
  categoryName: string
  items: Array<{
    slug: string
    phrase: {
      en: string
      [key: string]: string | { native: string; latin: string }
    }
  }>
}

export async function getAllCategoriesData(): Promise<CategoryData[]> {
  const dataDirectory = path.join(process.cwd(), 'src/data')
  const filenames = fs.readdirSync(dataDirectory)
    .filter(name => name.endsWith('.json'))
    .filter(name => name !== 'popular-phrases.json') // Skip popular-phrases as it has different structure
  
  const categories: CategoryData[] = []
  
  for (const filename of filenames) {
    try {
      const filepath = path.join(dataDirectory, filename)
      const fileContents = fs.readFileSync(filepath, 'utf8')
      const categoryData: CategoryData = JSON.parse(fileContents)
      
      // Ensure the data has the expected structure
      if (categoryData.items && Array.isArray(categoryData.items)) {
        categories.push(categoryData)
      }
    } catch (error) {
      console.warn(`Failed to load category data from ${filename}:`, error)
    }
  }
  
  return categories
}

export function generateLocaleSitemap(localeKey: string, categories: CategoryData[]): MetadataRoute.Sitemap {
  const baseUrl = 'https://affensus.com'
  
  // Get the locale path from settings
  const localePath = localeKey === 'en' ? '' : `/${localeKey}`
  
  // Base pages for this locale
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: localePath ? createFullUrl(baseUrl, localePath) : baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: createFullUrl(baseUrl, joinUrlPaths(localePath, '/morse-code/')),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: createFullUrl(baseUrl, joinUrlPaths(localePath, '/alphabet/')),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: createFullUrl(baseUrl, joinUrlPaths(localePath, '/search/')),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: createFullUrl(baseUrl, joinUrlPaths(localePath, '/morse-code-audio-decoder/')),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: createFullUrl(baseUrl, joinUrlPaths(localePath, '/morse-code-decoding-tree/')),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: createFullUrl(baseUrl, joinUrlPaths(localePath, '/contact/')),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: createFullUrl(baseUrl, joinUrlPaths(localePath, '/privacy/')),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: createFullUrl(baseUrl, joinUrlPaths(localePath, '/terms/')),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: createFullUrl(baseUrl, joinUrlPaths(localePath, '/conditions/')),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
  
  // Category pages for this locale
  const categoryPages: MetadataRoute.Sitemap = categories.map(category => ({
    url: createFullUrl(baseUrl, joinUrlPaths(localePath, '/morse-code/', category.categorySlug, '/')),
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  // Individual phrase pages for this locale
  const phrasePages: MetadataRoute.Sitemap = []
  
  for (const category of categories) {
    for (const phrase of category.items) {
      phrasePages.push({
        url: createFullUrl(baseUrl, joinUrlPaths(localePath, '/morse-code/', category.categorySlug, phrase.slug, '/')),
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })
    }
  }
  
  return [
    ...staticPages,
    ...categoryPages,
    ...phrasePages,
  ]
} 