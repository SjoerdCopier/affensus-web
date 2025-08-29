// Network monitors API - using external API server
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET /api/network-monitors - Get all monitors for a user
export async function onRequestGet(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // Get user ID from query params (you'll need to implement auth)
    const userId = url.searchParams.get('userId') || 'demo-user';
    
    // Use external API instead of D1
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
    }

    console.log('Making API request to:', 'https://apiv2.affensus.com/api/network-monitors');
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken.substring(0, 8)}...`
    });
    
    // Test if the API server is reachable
    try {
      const testResponse = await fetch('https://apiv2.affensus.com/health', { method: 'GET' });
      console.log('Health check response:', testResponse.status);
    } catch (healthError) {
      console.log('Health check failed:', healthError);
    }

    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/network-monitors?user_id=${encodeURIComponent(userId)}`, {
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
    
    // Ensure data is an array for the frontend
    const monitorsArray = Array.isArray(data) ? data : (data.monitors || data.data || []);
    
    return new Response(JSON.stringify({
      success: true,
      data: monitorsArray
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching network monitors:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch network monitors'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST /api/network-monitors - Create a new monitor
export async function onRequestPost(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id || (!body.domain && !body.dashboard_id)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'user_id and either domain or dashboard_id are required'
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

    console.log('Making API request to:', 'https://apiv2.affensus.com/api/network-monitors');
    console.log('Request body:', { 
      user_id: body.user_id, 
      domain: body.domain,
      dashboard_id: body.dashboard_id || body.domain 
    });
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken.substring(0, 8)}...`
    });

    let response;
    try {
      response = await fetch('https://apiv2.affensus.com/api/network-monitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          user_id: body.user_id,
          domain: body.domain,
          dashboard_id: body.dashboard_id || body.domain // Use dashboard_id if provided, otherwise fallback to domain
        }),
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
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating network monitor:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create network monitor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT /api/network-monitors - Update a monitor
export async function onRequestPut(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    // Validate required fields
    if (!body.id || !body.user_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'id and user_id are required'
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

    const response = await fetch(`https://apiv2.affensus.com/api/network-monitors/${body.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        user_id: body.user_id,
        enabled: body.enabled,
        display_name: body.display_name,
        notification_enabled: body.notification_enabled,
        check_interval_minutes: body.check_interval_minutes
      }),
    });

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
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating network monitor:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update network monitor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE /api/network-monitors - Delete a monitor
export async function onRequestDelete(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    // Validate required fields
    if (!body.id || !body.user_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'id and user_id are required'
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

    const response = await fetch(`https://apiv2.affensus.com/api/network-monitors/${body.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        user_id: body.user_id
      }),
    });

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
      message: 'Monitor deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting network monitor:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete network monitor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
