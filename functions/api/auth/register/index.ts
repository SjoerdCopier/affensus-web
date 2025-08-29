// User registration API - using external API server
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

// POST /api/auth/register - Register a new user
export async function onRequestPost(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.login_method) {
      return new Response(JSON.stringify({
        success: false,
        error: 'email and login_method are required'
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

    console.log('Making API request to:', 'https://apiv2.affensus.com/api/auth/register');
    console.log('Request body:', { 
      email: body.email, 
      name: body.name,
      login_method: body.login_method,
      subscription_status: body.subscription_status || 'free'
    });
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken.substring(0, 8)}...`
    });

    let response;
    try {
      response = await fetch('https://apiv2.affensus.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          email: body.email,
          name: body.name,
          login_method: body.login_method,
          subscription_status: body.subscription_status || 'free'
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
    console.error('Error registering user:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to register user'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}




