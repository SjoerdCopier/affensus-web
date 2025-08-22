export async function onRequestGet(context: { env: any, request: Request }): Promise<Response> {
  const { env } = context;
  
  const uptimeKumaUrl = env.UPTIME_KUMA_URL;
  const uptimeKumaSecret = env.UPTIME_KUMA_SECRET;
  
  if (!uptimeKumaSecret) {
    return new Response(JSON.stringify({ error: 'No secret' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(`${uptimeKumaUrl}/metrics`, {
      headers: {
        'Authorization': `Basic ${btoa(':' + uptimeKumaSecret)}`,
        'Accept': 'text/plain'
      }
    });

    return new Response(JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      hasSecret: !!uptimeKumaSecret,
      hasUrl: !!uptimeKumaUrl,
      secretPrefix: uptimeKumaSecret ? uptimeKumaSecret.substring(0, 10) + '...' : 'none',
      url: uptimeKumaUrl
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      hasSecret: !!uptimeKumaSecret,
      hasUrl: !!uptimeKumaUrl
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
