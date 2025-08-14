# Development Guide

## Starting the Development Server

### Build the Project First
```bash
# Build the Next.js project
npm run build

# This creates the 'out' directory with static assets
```

### Wrangler (Cloudflare Pages Functions)
```bash
# Start Wrangler development server on port 3000 with the 'out' directory
npx wrangler pages dev --port 3000 out

# Alternative: use default port 8787
npx wrangler pages dev --port 8787 out
```

### Next.js Development Server
```bash
# Start Next.js development server on port 3000
npm run dev

# Or specify port explicitly
npm run dev -- -p 3000
```

## Port Configuration

- **Wrangler**: Port 3000 (recommended) or 8787
- **Next.js**: Port 3000 (default)

## Environment Variables

Make sure you have the following environment variables set:
- `UPTIME_KUMA_SECRET`: Your Uptime Kuma API secret

## API Endpoints

- **Affiliate Network Uptime**: `/api/tools/affiliate-network-uptime`
- **Affiliate Link Checker**: `/api/tools/affiliate-link-checker`

## Testing

You can test the API endpoints with query parameters:
- `?debug=true` - Enable debug mode
- `?test=true` - Test status page fetching

## Troubleshooting

If you get authentication errors, check:
1. UPTIME_KUMA_SECRET is properly set
2. The Uptime Kuma server is accessible at `http://152.42.135.243:3001`
3. The status page endpoints are working
