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
    const { merchants } = body;

    if (!merchants || !Array.isArray(merchants)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'merchants array is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate each merchant object
    for (const merchant of merchants) {
      const { credential_id, program_id, network_id, project_id } = merchant;
      
      if (!credential_id || !program_id || !network_id || !project_id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Each merchant must have credential_id, program_id, network_id, and project_id' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Convert network_id to integer
      const networkId = parseInt(network_id);
      if (isNaN(networkId)) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'network_id must be a valid number' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Update the network_id in the merchant object
      merchant.network_id = networkId;
    }

    const apiUrl = 'https://apiv2.affensus.com/api/merchants/hidden';

    const requestPayload = { 
      merchants: merchants
    };

    console.log('Sending to apiv2:', JSON.stringify(requestPayload, null, 2));

    const apiv2Response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`, // Using same password as bearer token
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

    return new Response(JSON.stringify({ 
      success: true, 
      data: responseData 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error hiding merchants:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}






