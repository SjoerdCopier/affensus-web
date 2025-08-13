# Next.js Internationalization (i18n) Setup with next-intl

## Overview
This project uses next-intl for internationalization with a custom routing approach. The system supports multiple locales (English and Turkish) with manual routing and SEO optimization.

## Project Structure

```
src/
├── app/
│   ├── (default)/           # Default locale routes (English)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (localized)/         # Localized routes
│   │   └── [locale]/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── layout.tsx           # Root layout
│   └── not-found.tsx
├── components/
│   ├── hreflang-links.tsx
│   └── language-switcher.tsx
├── hooks/
│   └── use-locale-translations.ts
├── locales/
│   ├── settings.ts
│   ├── en.json
│   └── tr-tr.json
└── i18n.ts
```

## Key Components

### 1. Locale Settings (`src/locales/settings.ts`)
Configuration for supported locales including language labels, country codes, currencies, and SEO settings.

### 2. Next-intl Configuration (`src/i18n.ts`)
Main configuration file for next-intl that handles message loading and locale detection.

### 3. Translation Hook (`src/hooks/use-locale-translations.ts`)
Custom hook that provides:
- Automatic locale detection from URL
- Preloaded translations for performance
- Type-safe translation function
- Fallback to English when translations are missing

### 4. Language Switcher (`src/components/language-switcher.tsx`)
Component for switching between locales with proper URL handling.

### 5. Hreflang Links (`src/components/hreflang-links.tsx`)
SEO component that generates proper hreflang tags for search engines.

## Usage

### Basic Translation
```typescript
import { useLocaleTranslations } from '@/hooks/use-locale-translations';

export default function MyComponent() {
  const { t, currentLocale } = useLocaleTranslations();
  
  return (
    <div>
      <h1>{t('metadata.homepage.title')}</h1>
      <p>Current locale: {currentLocale}</p>
    </div>
  );
}
```

### Adding New Locales
1. Add locale configuration to `src/locales/settings.ts`
2. Create translation file `src/locales/[locale].json`
3. Update the `generateStaticParams` function in the localized layout

### Adding New Translation Keys
1. Add keys to all locale JSON files
2. Use nested structure for organization: `section.subsection.key`

## Routing

- **English (default)**: `/` (no locale prefix)
- **Turkish**: `/tr-tr/`
- **Other locales**: `/[locale]/`

## SEO Features

- Automatic hreflang generation
- Canonical URLs for each locale
- Proper language attributes on HTML elements
- Static generation support for all locales

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Benefits

- Clean URL structure
- SEO-friendly with proper hreflang implementation
- Performance optimized with preloading
- Type-safe translation keys
- Easy to maintain and extend
- Supports unlimited locales
- Automatic locale detection from URL
