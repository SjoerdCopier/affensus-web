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
    // Use the same environment variable for both encryption and API auth
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
    const { project_id } = body;

    if (!project_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'project_id is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiUrl = 'https://apiv2.affensus.com/api/refresh-published';

    const requestPayload = { 
      projectId: project_id
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

    // Map the response to match our Statistics interface
    const mappedResponse = {
      success: responseData.success,
      message: responseData.message,
      linkRot: {
        totalCount: responseData.totalCount,
        validCount: responseData.validCount,
        brokenLinks: responseData.brokenLinks || [], // Use the actual broken links data from the API
        unmatchedCount: responseData.unmatchedCount,
        inactiveNetworks: responseData.inactiveNetworks
      },
      stoppedLinks: responseData.invalidCount + responseData.unmatchedCount
    };

    return new Response(JSON.stringify(mappedResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error refreshing published links:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
