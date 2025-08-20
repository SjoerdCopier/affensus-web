import { verifyJwt } from '../../../src/lib/jwt'

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=')
    if (name && value) {
      cookies[name] = decodeURIComponent(value)
    }
    return cookies
  }, {} as Record<string, string>)
}

async function getUserById(db: any, userId: string) {
  try {
    const user = await db.prepare(`
      SELECT id, email, first_name, last_name, avatar_url, subscription_status, 
             stripe_customer_id, subscription_expires_at, trial_ends_at, 
             created_at, updated_at
      FROM users 
      WHERE id = ?
    `).bind(userId).first()
    
    return user
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

// GET - Check if user needs to complete profile
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
        return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
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

      const user = await getUserById(db, decoded.sub)
      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Check if user has personal data (first name and last name)
      const hasPersonalData = !!(user.first_name && user.last_name)

      // Check if user has billing address
      const billingAddress = await db.prepare(`
        SELECT line1, line2, city, state, postal_code, country
        FROM user_billing_addresses 
        WHERE user_id = ?
      `).bind(decoded.sub).first()

      const hasBillingAddress = !!billingAddress

      // Determine if profile completion is needed
      const needsProfileCompletion = !hasPersonalData || !hasBillingAddress

      return new Response(JSON.stringify({
        needsProfileCompletion,
        hasPersonalData,
        hasBillingAddress,
        isPaidUser: user.subscription_status !== 'free'
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
    console.error('Error checking profile completion status:', error)
    return new Response(JSON.stringify({ error: 'Failed to check profile completion status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
