export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPost(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    
    const requestBody = await request.json();
    const { url } = requestBody;

    if (!url) {
      return new Response(JSON.stringify({
        success: false,
        error: 'URL is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
    }

    const apiUrl = `https://apiv2.affensus.com/api/get-logo`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ url }),
    });

    console.log('url', JSON.stringify({ url }));
    console.log('response', response);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      data: data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=0, s-maxage=0'
      }
    });
  } catch (error) {
    console.error('Error fetching logo:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch logo'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
