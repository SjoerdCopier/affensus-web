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

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    // Use the same environment variable for API auth
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'AFFENSUS_CREDENTIALS_PASSWORD not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'URL is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiUrl = 'https://apiv2.affensus.com/api/redirect-checker';

    const requestPayload = { 
      url: url
    };

    console.log('Sending to apiv2:', JSON.stringify(requestPayload, null, 2));

    const apiv2Response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`,
      },
      body: JSON.stringify(requestPayload)
    });

    if (!apiv2Response.ok) {
      const errorText = await apiv2Response.text();
      console.error('apiv2 error response:', errorText);
      console.error('apiv2 status:', apiv2Response.status, apiv2Response.statusText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `External API error: ${apiv2Response.status} ${apiv2Response.statusText}`,
        details: errorText
      }), {
        status: apiv2Response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const responseData = await apiv2Response.json();
    console.log('Response data:', responseData);
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: responseData 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error checking redirects:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}