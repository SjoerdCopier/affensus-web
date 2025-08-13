'use client'

import { useEffect, useState } from 'react'
import { locales as localeSettings } from '../locales/settings'

interface Translations {
  [key: string]: string | Translations;
}

const preloadedTranslations: { [locale: string]: Translations } = {}
let preloadPromise: Promise<void> | null = null

function preloadTranslations(): Promise<void> {
  if (preloadPromise) return preloadPromise

  preloadPromise = Promise.all(
    Object.keys(localeSettings).map(async (locale) => {
      try {
        const translations = await import(`../locales/${locale}.json`)
        preloadedTranslations[locale] = translations.default
      } catch {
        console.warn(`Failed to load translations for locale: ${locale}`)
      }
    })
  ).then(() => {})

  return preloadPromise
}

function detectLocale(pathname: string): string {
  const nonEnglishLocales = Object.keys(localeSettings).filter(locale => locale !== 'en')
  const matchedLocale = nonEnglishLocales.find(locale => pathname.startsWith(`/${locale}`))
  return matchedLocale || 'en'
}

export function useLocaleTranslations() {
  const initialLocale = typeof window !== 'undefined' ? detectLocale(window.location.pathname) : 'en'
  const [currentLocale, setCurrentLocale] = useState(initialLocale)
  const [translations, setTranslations] = useState<Translations | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const pathname = window.location.pathname
    const matchedLocale = detectLocale(pathname)
    
    setCurrentLocale(matchedLocale)

    preloadTranslations().then(() => {
      if (preloadedTranslations[matchedLocale]) {
        setTranslations(preloadedTranslations[matchedLocale])
      } else {
        setTranslations(preloadedTranslations['en'])
      }
      setIsLoaded(true)
    })
  }, [])

  const t = (key: string): string => {
    if (!isLoaded || !translations) return key

    const keys = key.split('.')
    let value: string | Translations | undefined = translations
    
    for (const k of keys) {
      if (typeof value === 'object' && value !== null) {
        value = value[k]
      } else {
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  return { t, currentLocale, isLoaded }
}
