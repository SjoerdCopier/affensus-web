// API endpoint for marking a single notification as read
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function onRequestPut(context: { 
  request: Request; 
  env: { AFFENSUS_CREDENTIALS_PASSWORD: string };
  params: { project_id: string; notification_id: string }
}) {
  try {
    const { request, env, params } = context;
    const { project_id, notification_id } = params;

    if (!project_id || !notification_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Project ID and notification ID are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use external API
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
    }

    console.log('Making API request to:', `https://apiv2.affensus.com/api/notifications/${project_id}/${notification_id}/read`);

    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/notifications/${project_id}/${notification_id}/read`, {
        method: 'PUT',
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
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
