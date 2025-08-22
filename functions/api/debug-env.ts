export async function onRequestGet(context: { env: any, request: Request }): Promise<Response> {
  const { env } = context;
  
  const envDebug = {
    hasUptimeKumaUrl: !!env.UPTIME_KUMA_URL,
    hasUptimeKumaSecret: !!env.UPTIME_KUMA_SECRET,
    hasJwtSecret: !!env.JWT_SECRET,
    hasSiteUrl: !!env.SITE_URL,
    hasDB: !!env.DB,
    // Show actual values (be careful with this in production)
    uptimeKumaUrl: env.UPTIME_KUMA_URL ? `${env.UPTIME_KUMA_URL.substring(0, 20)}...` : 'undefined',
    siteUrl: env.SITE_URL || 'undefined',
    environment: typeof caches !== 'undefined' ? 'cloudflare' : 'local'
  };

  return new Response(JSON.stringify(envDebug, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
