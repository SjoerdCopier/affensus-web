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

export async function onRequestGet(context: { request: Request; env: any; params: any }) {
  const { request, env, params } = context;
  const { project_id, notification_id } = params;

  try {
    console.log('Project ID:', project_id);
    console.log('Notification ID:', notification_id);

    if (!project_id || !notification_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'project_id and notification_id are required' 
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

    const apiUrl = `https://apiv2.affensus.com/api/notifications/${project_id}/${notification_id}`;

    console.log('Making GET request to:', apiUrl);

    const apiv2Response = await fetch(apiUrl, {
      method: 'GET',
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

    // Log the full response data to debug display_url issue
    console.log('=== NOTIFICATION API RESPONSE DEBUG ===');
    console.log('Full response data:', JSON.stringify(responseData, null, 2));
    
    // Log specific parts of the data structure
    if (responseData.notification && responseData.notification.extra_data) {
      console.log('=== EXTRA DATA DEBUG ===');
      console.log('Extra data:', JSON.stringify(responseData.notification.extra_data, null, 2));
      
      if (responseData.notification.extra_data.new_merchants) {
        console.log('=== NEW MERCHANTS DEBUG ===');
        responseData.notification.extra_data.new_merchants.forEach((merchant: Record<string, unknown>, index: number) => {
          console.log(`New Merchant ${index}:`, {
            merchant_name: merchant.merchant_name,
            merchant_display_url: merchant.merchant_display_url,
            program_id: merchant.program_id
          });
        });
      }
      
      if (responseData.notification.extra_data.status_changes) {
        console.log('=== STATUS CHANGES DEBUG ===');
        responseData.notification.extra_data.status_changes.forEach((change: Record<string, unknown>, index: number) => {
          console.log(`Status Change ${index}:`, {
            merchant_name: change.merchant_name,
            merchant_display_url: change.merchant_display_url,
            program_id: change.program_id
          });
        });
      }
      
      if (responseData.notification.extra_data.removed_merchants) {
        console.log('=== REMOVED MERCHANTS DEBUG ===');
        responseData.notification.extra_data.removed_merchants.forEach((merchant: Record<string, unknown>, index: number) => {
          console.log(`Removed Merchant ${index}:`, {
            merchant_name: merchant.merchant_name,
            merchant_display_url: merchant.merchant_display_url,
            program_id: merchant.program_id
          });
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: responseData 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching notification:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

