// API endpoint for refreshing wishlist
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

async function verifyJwt(token: string, secret: string): Promise<any> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.')
    
    // Decode and verify
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    
    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`)
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    
    const isValid = await crypto.subtle.verify('HMAC', key, signature, dataToVerify)
    
    if (!isValid) {
      throw new Error('Invalid signature')
    }
    
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired')
    }
    
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {}
  
  if (!cookieHeader) {
    return cookies
  }
  
  cookieHeader.split('; ').forEach(cookie => {
    const [name, value] = cookie.split('=')
    if (name && value) {
      cookies[name] = decodeURIComponent(value)
    }
  })
  
  return cookies
}

export interface RefreshWishlistRequest {
  projectId: string;
  sendNotification: boolean;
}

export interface RefreshWishlistResponse {
  success: boolean;
  message: string;
  newCount: number;
  counts: {
    "Approved": number;
    "Pending": number;
    "Not joined": number;
    "Suspended": number;
  };
  wishlistInfo: Array<{
    wishlist_name: string;
    wishlist_url: string;
    project_unique_identifier: string;
    status: string;
    clean_name: string;
    display_url: string;
    program_id: string;
    network_name: string;
    network_id: number;
    match_type: string;
  }>;
}

// POST /api/refresh-wishlist - Refresh wishlist for a project
export async function onRequestPost(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    const body = await request.json() as RefreshWishlistRequest;
    
    // Validate required fields
    if (!body.projectId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'projectId is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get JWT token from cookie
    const cookieHeader = request.headers.get('Cookie');
    let token: string | null = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split('; ');
      const authCookie = cookies.find((c: string) => c.startsWith('auth-token='));
      if (authCookie) {
        const encodedToken = authCookie.split('=')[1];
        token = decodeURIComponent(encodedToken);
      }
    }

    if (!token) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'No authentication token' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'JWT secret not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const payload = await verifyJwt(token, jwtSecret);
      
      if (!payload) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Invalid or expired token' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Use external API
      const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
      if (!bearerToken) {
        throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
      }

      console.log('Making API request to:', 'https://apiv2.affensus.com/api/refresh-wishlist');
      console.log('Request body:', { 
        projectId: body.projectId, 
        sendNotification: body.sendNotification || false
      });
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken.substring(0, 8)}...`
      });

      let response;
      try {
        response = await fetch('https://apiv2.affensus.com/api/refresh-wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({
            projectId: body.projectId,
            sendNotification: body.sendNotification || false
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

      const data = await response.json() as RefreshWishlistResponse;
      
      // Log only the new numbers to terminal
      console.log('New wishlist numbers:', {
        newCount: data.newCount,
        counts: data.counts
      });
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    } catch (error) {
      console.error('JWT verification error:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Invalid token' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Refresh wishlist error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
