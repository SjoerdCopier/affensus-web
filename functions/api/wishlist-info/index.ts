import { verifyJwt } from '../../../src/lib/jwt'

// API endpoint for fetching wishlist info
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


export interface WishlistInfoRequest {
  project_id: string;
}

export interface WishlistInfoResponse {
  project_id: string;
  total_items: number;
  wishlistInfo: Array<{
    clean_name: string;
    commission: {
      payouts: {
        CPS: Array<{
          currency: string | null;
          item: string;
          value: string;
        }>;
      };
    };
    deeplink: string;
    description: string | null;
    display_url: string;
    logo: string;
    match_type: string;
    merchant_id: number;
    network_id: number;
    network_name: string;
    program_id: string;
    project_unique_identifier: string;
    status: string;
    wishlist_name: string;
    wishlist_url: string;
  }>;
}

// POST /api/wishlist-info - Get wishlist info for a project
export async function onRequestPost(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    const body = await request.json() as WishlistInfoRequest;
    
    // Validate required fields
    if (!body.project_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'project_id is required'
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
      const authCookie = cookies.find(c => c.startsWith('auth-token='));
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

      console.log('Making API request to:', 'https://apiv2.affensus.com/api/wishlist-info');
      console.log('Request body:', { project_id: body.project_id });
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken.substring(0, 8)}...`
      });

      let response;
      try {
        response = await fetch('https://apiv2.affensus.com/api/wishlist-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({
            project_id: body.project_id
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

      const data = await response.json() as WishlistInfoResponse;
      
      return new Response(JSON.stringify({
        success: true,
        data: data
      }), {
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
    console.error('Wishlist info error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
