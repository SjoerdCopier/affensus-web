# Project Setup & Configuration Guide

## Project Overview
**Affensus Web** - A Next.js-based web application with Cloudflare Pages deployment

## Technology Stack & Versions

### Core Framework
- **Next.js**: 15.x (App Router)
- **React**: 18.x
- **TypeScript**: 5.x (Strict Mode Enabled)

### Build & Deployment
- **Cloudflare Pages**: For hosting and edge functions
- **Wrangler**: For Cloudflare development and deployment
- **Build Output**: Static export to `out/` directory

### Development Environment
- **Node.js**: 18+ (LTS recommended)
- **Package Manager**: npm
- **OS**: macOS (darwin 24.5.0)

## TypeScript Configuration

### Strict Mode Enabled
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Key TypeScript Rules
- **NO `any` types** - Use proper interfaces and types
- **Strict null checks** - Handle undefined/null explicitly
- **Proper typing** - All functions, props, and state must be typed
- **Interface definitions** - Define interfaces for all data structures

## ESLint Configuration

### Strict Rules Enabled
- **@typescript-eslint/no-unused-vars**: No unused variables
- **@typescript-eslint/no-explicit-any**: No explicit any types
- **@next/next/no-img-element**: Use Next.js Image component
- **react/no-unescaped-entities**: Proper HTML entity escaping

### Common Issues to Avoid
- Using `<img>` instead of `<Image>` from next/image
- Unused imports or variables
- Explicit `any` types
- Unescaped apostrophes in JSX

## Next.js Configuration

### App Router Structure
```
src/app/
├── (default)/          # Default locale (en)
│   ├── dashboard/
│   │   └── profile/
│   └── ...
├── (localized)/        # Localized routes
│   └── [locale]/
│       ├── dashboard/
│       │   └── profile/
│       └── ...
└── api/                # API routes
```

### Important Notes
- **Params are Promises**: In Next.js 15, `params` is `Promise<{ locale: string }>`
- **Static Export**: Builds to `out/` directory for Cloudflare Pages
- **Internationalization**: Uses next-intl for localization

## Development Commands

### Local Development
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
```

### Cloudflare Development
```bash
npx wrangler pages dev --port 3000 out
```

### Build Process
```bash
npm run build        # Build Next.js app
# Output goes to out/ directory
# Deploy to Cloudflare Pages
```

## Authentication & API

### API Structure
- **Edge Functions**: Located in `functions/api/`
- **JWT Authentication**: HttpOnly cookies
- **OAuth Providers**: Google, GitHub, Facebook, Magic Link

### User Data Flow
1. OAuth callback creates/updates user in database
2. JWT token stored in HttpOnly cookie
3. Frontend fetches user data via `/api/user` and `/api/profile`
4. User data includes: email, avatar, login method, profile info

## Component Architecture

### Dashboard Components
- **DashboardLayout**: Main layout wrapper
- **DashboardHeader**: Top navigation with user info
- **DashboardSidebar**: Left navigation menu
- **ProfilePageComponent**: User profile management

### Key Patterns
- **Client Components**: Use "use client" directive
- **Server Components**: Default for pages and layouts
- **Hooks**: Custom hooks for data fetching (e.g., `useUser`)
- **Type Safety**: All props and state properly typed

## Internationalization

### Locale Support
- **Default**: English (en)
- **Supported**: Dutch (nl-nl)
- **Structure**: `/[locale]/path` for localized routes

### Translation Files
- **Location**: `src/locales/`
- **Format**: JSON files
- **Hook**: `useLocaleTranslations()`

## Database & Storage

### Cloudflare D1
- **SQLite-based** database
- **Edge-ready** for global performance
- **Schema**: Users, profiles, invoices, etc.

### R2 Storage
- **Object storage** for files and assets
- **Avatar images** stored in R2
- **CDN distribution** via Cloudflare

## Deployment

### Cloudflare Pages
- **Build Command**: `npm run build`
- **Build Output**: `out/`
- **Environment Variables**: Set in Cloudflare dashboard
- **Edge Functions**: Automatically deployed with pages

### Environment Variables
- **JWT_SECRET**: For authentication
- **DB**: D1 database binding
- **R2**: Object storage binding
- **OAuth Keys**: Google, GitHub, Facebook client IDs/secrets

## Common Development Patterns

### User Data Fetching
```typescript
const { user, userProfile, isLoading } = useUser()
```

### Route Protection
```typescript
// Check authentication in useEffect
if (!data.authenticated) {
  window.location.href = '/auth'
}
```

### Error Handling
```typescript
try {
  const response = await fetch('/api/endpoint')
  if (!response.ok) throw new Error('Failed')
} catch (error) {
  console.error('Error:', error)
  // Handle error appropriately
}
```

## Quality Standards

### Code Quality
- **TypeScript strict mode** - No exceptions
- **ESLint compliance** - All rules must pass
- **Proper error handling** - Try/catch blocks
- **Loading states** - Show loading indicators
- **Error boundaries** - Graceful error handling

### Performance
- **Next.js Image** - Optimized image loading
- **Lazy loading** - Components loaded on demand
- **Efficient data fetching** - Minimize API calls
- **Static generation** - Where possible

### Security
- **HttpOnly cookies** - JWT tokens
- **Input validation** - Server-side validation
- **CSRF protection** - Via Cloudflare
- **OAuth flows** - Proper redirect handling

## Troubleshooting

### Common Issues
1. **TypeScript errors**: Check strict mode compliance
2. **ESLint warnings**: Fix unused variables, proper typing
3. **Build failures**: Check Next.js 15 compatibility
4. **Authentication issues**: Verify JWT and cookie setup

### Debug Commands
```bash
npm run lint          # Check ESLint
npm run type-check    # Check TypeScript
npm run build         # Full build check
```

---

**Remember**: This project uses strict TypeScript and ESLint rules. Always ensure proper typing, no unused variables, and Next.js best practices.
