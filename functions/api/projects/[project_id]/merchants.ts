// Project merchants API - using external API server
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET /api/projects/[project_id]/merchants?network_id=<network_id>&credential_id=<credential_id> - Get project merchants
export async function onRequestGet(context: { request: Request; env: any; params: any }) {
  try {
    const { request, env, params } = context;
    const projectId = params.project_id;
    
    if (!projectId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Project ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get query parameters
    const url = new URL(request.url);
    const networkId = url.searchParams.get('network_id');
    const credentialId = url.searchParams.get('credential_id');

    if (!networkId || !credentialId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'network_id and credential_id are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use external API instead of D1
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
    }

    const apiUrl = `https://apiv2.affensus.com/api/projects/${projectId}/merchants?network_id=${networkId}&credential_id=${credentialId}`;
    console.log('Making API request to:', apiUrl);
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken.substring(0, 8)}...`
    });

    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
      throw new Error(`Network error: ${errorMessage}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Log the response for debugging
    console.log('Merchants API Response:', JSON.stringify(data, null, 2));
    
    return new Response(JSON.stringify({
      success: true,
      data: data
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300, s-maxage=0' // 5 minutes cache for merchants data
      }
    });
  } catch (error) {
    console.error('Error fetching project merchants:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch project merchants'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

