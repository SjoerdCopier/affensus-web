import { verifyJwt } from '../../../src/lib/jwt'

// Parse cookies from header (same as /api/user)
function parseCookies(cookieHeader: string | null): { [key: string]: string } {
  const cookies: { [key: string]: string } = {}
  if (!cookieHeader) return cookies
  
  const cookiePairs = cookieHeader.split('; ')
  for (const cookie of cookiePairs) {
    const [name, ...rest] = cookie.split('=')
    if (name && rest.length > 0) {
      // Handle URL encoding like in /api/user
      const value = rest.join('=') // Handle values with = signs
      cookies[name] = decodeURIComponent(value)
    }
  }
  
  return cookies
}

async function getUserById(db: any, userId: string) {
  return await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
}

async function updateUser(db: any, userId: string, data: any) {
  const { firstName, lastName } = data
  
  await db.prepare(`
    UPDATE users 
    SET first_name = ?, last_name = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(firstName, lastName, userId).run()
  
  return await getUserById(db, userId)
}

// GET - Get user profile
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

      // Format user data for frontend
      const userProfile = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        subscriptionStatus: user.subscription_status || 'free',
        stripeCustomerId: user.stripe_customer_id,
        subscriptionExpiresAt: user.subscription_expires_at,
        trialEndsAt: user.trial_ends_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }

      return new Response(JSON.stringify({
        user: userProfile
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
    console.error('Error getting user profile:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// PUT - Update user profile
export async function onRequestPut(context: any) {
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
      const updateData = await request.json()
      
      const db = env.DB
      if (!db) {
        return new Response(JSON.stringify({ error: 'Database not available' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const updatedUser = await updateUser(db, decoded.sub, updateData)
      if (!updatedUser) {
        return new Response(JSON.stringify({ error: 'Failed to update user' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Format user data for frontend
      const userProfile = {
        id: updatedUser.id.toString(),
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        avatarUrl: updatedUser.avatar_url,
        subscriptionStatus: updatedUser.subscription_status || 'free',
        stripeCustomerId: updatedUser.stripe_customer_id,
        subscriptionExpiresAt: updatedUser.subscription_expires_at,
        trialEndsAt: updatedUser.trial_ends_at,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      }

      return new Response(JSON.stringify({
        user: userProfile
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
    console.error('Error updating user profile:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 