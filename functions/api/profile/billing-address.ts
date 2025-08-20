import { verifyJwt } from '../../../src/lib/jwt'

// Parse cookies from header
function parseCookies(cookieHeader: string | null): { [key: string]: string } {
  const cookies: { [key: string]: string } = {}
  if (!cookieHeader) return cookies
  
  const cookiePairs = cookieHeader.split('; ')
  for (const cookie of cookiePairs) {
    const [name, ...rest] = cookie.split('=')
    if (name && rest.length > 0) {
      cookies[name] = rest.join('=') // Handle values with = signs
    }
  }
  
  return cookies
}

// GET - Get billing address
export async function onRequestGet(context: any) {
  try {
    const { request, env } = context
    const cookies = parseCookies(request.headers.get('Cookie'))
    const token = cookies['auth-token']

    if (!token) {
      return new Response(JSON.stringify({ error: 'No authentication token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const jwtSecret = env.JWT_SECRET
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: 'JWT secret not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const decoded = await verifyJwt(token, jwtSecret)
      if (!decoded) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      const db = env.DB
      if (!db) {
        return new Response(JSON.stringify({ error: 'Database not available' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Get billing address from database
      const address = await db.prepare(`
        SELECT line1, line2, city, state, postal_code, country
        FROM user_billing_addresses 
        WHERE user_id = ?
      `).bind(decoded.sub).first()

      return new Response(JSON.stringify({ 
        address: address || null 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (jwtError) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error fetching billing address:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch billing address' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// PUT - Update billing address
export async function onRequestPut(context: any) {
  try {
    const { request, env } = context
    
    // Get JWT token from cookie
    const cookieHeader = request.headers.get('Cookie')
    let token: string | null = null
    
    if (cookieHeader) {
      const cookies = cookieHeader.split('; ')
      const authCookie = cookies.find((c: string) => c.startsWith('auth-token='))
      if (authCookie) {
        token = authCookie.split('=')[1]
      }
    }

    if (!token) {
      return new Response(JSON.stringify({ error: 'No authentication token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const jwtSecret = env.JWT_SECRET
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: 'JWT secret not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const decoded = await verifyJwt(token, jwtSecret)
      if (!decoded) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const { line1, line2, city, state, postalCode, country } = await request.json()

      // Validate required fields
      if (!line1 || !city || !postalCode || !country) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const db = env.DB
      if (!db) {
        return new Response(JSON.stringify({ error: 'Database not available' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Upsert billing address
      await db.prepare(`
        INSERT INTO user_billing_addresses (user_id, line1, line2, city, state, postal_code, country, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
          line1 = excluded.line1,
          line2 = excluded.line2,
          city = excluded.city,
          state = excluded.state,
          postal_code = excluded.postal_code,
          country = excluded.country,
          updated_at = datetime('now')
      `).bind(decoded.sub, line1, line2 || null, city, state, postalCode, country).run()

      return new Response(JSON.stringify({ 
        success: true,
        address: { line1, line2, city, state, postalCode, country }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (jwtError) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error saving billing address:', error)
    return new Response(JSON.stringify({ error: 'Failed to save billing address' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 