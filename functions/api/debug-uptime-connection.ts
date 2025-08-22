export async function onRequestGet(context: { env: any, request: Request }): Promise<Response> {
  const { env } = context;
  
  const uptimeKumaUrl = env.UPTIME_KUMA_URL;
  const uptimeKumaSecret = env.UPTIME_KUMA_SECRET;
  
  if (!uptimeKumaSecret || !uptimeKumaUrl) {
    return new Response(JSON.stringify({ 
      error: 'Missing credentials',
      hasSecret: !!uptimeKumaSecret,
      hasUrl: !!uptimeKumaUrl 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const debugInfo: any = {
    url: uptimeKumaUrl,
    timestamp: new Date().toISOString(),
    cloudflareHeaders: {},
    testResults: []
  };

  // Capture Cloudflare-specific request info
  const cfHeaders = ['cf-ray', 'cf-ipcountry', 'cf-connecting-ip'];
  cfHeaders.forEach(header => {
    const value = context.request.headers.get(header);
    if (value) debugInfo.cloudflareHeaders[header] = value;
  });

  // Test 1: Basic connectivity
  try {
    const testUrl = `${uptimeKumaUrl}/metrics`;
    const response = await fetch(testUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Cloudflare-Pages-Debug/1.0'
      }
    });
    
    debugInfo.testResults.push({
      test: 'HEAD request',
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
  } catch (error) {
    debugInfo.testResults.push({
      test: 'HEAD request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 2: GET with auth
  try {
    const testUrl = `${uptimeKumaUrl}/metrics`;
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Basic ${btoa(':' + uptimeKumaSecret)}`,
        'Accept': 'text/plain',
        'User-Agent': 'Cloudflare-Pages-Debug/1.0'
      }
    });
    
    debugInfo.testResults.push({
      test: 'GET with auth',
      status: response.status,
      statusText: response.statusText,
      responsePreview: response.ok ? (await response.text()).substring(0, 200) : 'Not OK'
    });
  } catch (error) {
    debugInfo.testResults.push({
      test: 'GET with auth',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 3: Different endpoint
  try {
    const testUrl = uptimeKumaUrl; // Just the base URL
    const response = await fetch(testUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Cloudflare-Pages-Debug/1.0'
      }
    });
    
    debugInfo.testResults.push({
      test: 'Base URL HEAD',
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    debugInfo.testResults.push({
      test: 'Base URL HEAD',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return new Response(JSON.stringify(debugInfo, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
