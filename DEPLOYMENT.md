# Cloudflare Pages Deployment Guide

## Local Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run pages:dev
```

## Deployment

### First Time Setup

1. Install Wrangler CLI globally (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Configure your project in `wrangler.toml` if needed.

### Deploy to Cloudflare Pages

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npm run pages:deploy
```

### Environment Variables

Set environment variables in your Cloudflare Pages dashboard or via wrangler:

```bash
wrangler pages secret put MY_SECRET
```

## Configuration

- **Static Export**: Enabled in `next.config.ts`
- **Output Directory**: `out/` (configured in `wrangler.toml`)
- **Trailing Slash**: Enabled for better Cloudflare compatibility
- **Images**: Unoptimized (required for static export)

## Notes

- This project is configured for static export, so all pages are pre-rendered at build time
- Server-side features like API routes won't work in this static configuration
- Use `getStaticProps` and `getStaticPaths` for data fetching

