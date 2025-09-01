'use client'

import { useEffect, useState } from 'react'
import { locales as localeSettings } from '../locales/settings'
import enTranslations from '../locales/en.json'
import nlTranslations from '../locales/nl-nl.json'

type TranslationValue = string | TranslationObject | string[];

interface TranslationObject {
  [key: string]: TranslationValue;
}

interface Translations {
  [key: string]: TranslationValue;
}

// Pre-load translations synchronously to avoid SSR issues
const staticTranslations: { [locale: string]: TranslationObject } = {
  'en': enTranslations as TranslationObject,
  'nl-nl': nlTranslations as TranslationObject
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
  const [translations, setTranslations] = useState<TranslationObject>(staticTranslations[initialLocale] || staticTranslations['en'])
  const [isLoaded, setIsLoaded] = useState(true) // Start as loaded since we have static translations

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
    // Always use translations, fallback to static if needed
    const translationSource = translations || staticTranslations[currentLocale] || staticTranslations['en']
    
    if (!translationSource) return key

    const keys = key.split('.')
    let value: TranslationValue | undefined = translationSource as TranslationValue
    
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        value = value[k]
      } else {
        // Try English fallback if not found in current locale
        if (currentLocale !== 'en' && staticTranslations['en']) {
          let enValue: TranslationValue | undefined = staticTranslations['en'] as TranslationValue
          for (const enKey of keys) {
            if (typeof enValue === 'object' && enValue !== null && !Array.isArray(enValue)) {
              enValue = enValue[enKey]
            } else {
              return key
            }
          }
          return typeof enValue === 'string' ? enValue : key
        }
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  return { t, currentLocale, isLoaded }
}
