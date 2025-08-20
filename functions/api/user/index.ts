import { verifyJwt } from '../../../src/lib/jwt'

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function onRequestGet(context: { request: Request; env: any }): Promise<Response> {
  try {
    const { request, env } = context

    // Get JWT token from cookie (since it's HttpOnly, we can only access it server-side)
    const cookieHeader = request.headers.get('Cookie')
    
    let token: string | null = null
    
    if (cookieHeader) {
      const cookies = cookieHeader.split('; ')
      const authCookie = cookies.find(c => c.startsWith('auth-token='))
      if (authCookie) {
        const encodedToken = authCookie.split('=')[1]
        token = decodeURIComponent(encodedToken)
      }
    }

    if (!token) {
      return new Response(JSON.stringify({
        authenticated: false,
        user: null
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verify JWT token
    const jwtSecret = env.JWT_SECRET
    if (!jwtSecret) {
      return new Response(JSON.stringify({
        error: 'JWT secret not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const payload = await verifyJwt(token, jwtSecret)
      
      if (!payload) {
        return new Response(JSON.stringify({
          authenticated: false,
          user: null
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Return user info if authenticated
      return new Response(JSON.stringify({
        authenticated: true,
        user: {
          id: payload.sub,
          email: payload.email,
          loginMethod: payload.login_method
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (error) {
      return new Response(JSON.stringify({
        authenticated: false,
        user: null,
        error: 'Invalid token'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error checking authentication:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 