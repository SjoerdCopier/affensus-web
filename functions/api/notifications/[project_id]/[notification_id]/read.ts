export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPut(context: { request: Request; env: any; params: any }) {
  try {
    const { env, params } = context;
    const projectId = params.project_id;
    const notificationId = params.notification_id;

    if (!projectId || !notificationId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Project ID and Notification ID are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
    }

    const apiUrl = `https://apiv2.affensus.com/api/notifications/${projectId}/${notificationId}/read`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

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
    console.error('Error marking notification as read:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to mark notification as read'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}