// User data API - using external API server
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

// GET /api/users/[userId] - Get user data by user ID
export async function onRequestGet(context: { request: Request; env: any; params: any }) {
  try {
    const { request, env, params } = context;
    const userId = params.userId;
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
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

    console.log('Making API request to:', `https://apiv2.affensus.com/api/users/${userId}`);
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken.substring(0, 8)}...`
    });

    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/users/${userId}`, {
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
    
    return new Response(JSON.stringify({
      success: true,
      data: data
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300, s-maxage=0' // 5 minutes cache for user data
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch user data'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

