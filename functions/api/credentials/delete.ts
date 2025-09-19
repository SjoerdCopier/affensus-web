export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestDelete(context: { request: Request; env: any }) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { credential_id } = body;
    console.log('Credential ID:', credential_id);

    if (!credential_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'credential_id is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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

    const apiUrl = `https://apiv2.affensus.com/api/credentials/${credential_id}`;

    console.log('Making DELETE request to:', apiUrl);

    const apiv2Response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`,
      }
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

    return new Response(JSON.stringify({ 
      success: true, 
      data: responseData 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error deleting credentials:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
