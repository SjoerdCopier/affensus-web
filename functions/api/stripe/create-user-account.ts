import { verifyJwt } from '../../../src/lib/jwt'
import { signJwt } from '../../../src/lib/jwt'

function parseCookies(cookieHeader: string | null): { [key: string]: string } {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=')
    cookies[name] = value
    return cookies
  }, {} as { [key: string]: string })
}

async function getUserByEmail(db: any, email: string) {
  return await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
}

async function createUserAccount(db: any, email: string, loginMethod: string, stripeCustomerId?: string) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (email, preferred_login_method, stripe_customer_id, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `)
  const result = await stmt.bind(email, loginMethod, stripeCustomerId || null).run()
  
  // Get the user (either just created or existing)
  const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
  
  // Check if this is a new user by checking if the insert actually happened
  const isNewUser = result.changes > 0
  
  return { user, isNewUser }
}

async function updateStripeCustomerId(db: any, email: string, stripeCustomerId: string) {
  await db.prepare(`
    UPDATE users 
    SET stripe_customer_id = ?, updated_at = datetime('now')
    WHERE email = ?
  `).bind(stripeCustomerId, email).run()
}

// POST - Create user account for paid users
export const onRequest = async (context: { request: Request; env: any }): Promise<Response> => {
  try {
    const { request, env } = context
    const { email, loginMethod, sessionId } = await request.json()

    if (!email || !loginMethod) {
      return new Response(JSON.stringify({ error: 'Email and login method are required' }), {
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

    // If sessionId is provided, try to find the Stripe customer ID
    let stripeCustomerId: string | null = null
    if (sessionId) {
      try {
        const stripeSecretKey = env.STRIPE_SECRET_KEY
        if (stripeSecretKey) {
          const sessionResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
            headers: {
              'Authorization': `Bearer ${stripeSecretKey}`,
            },
          })
          
          if (sessionResponse.ok) {
            const session = await sessionResponse.json()
            if (session.customer) {
              stripeCustomerId = session.customer
            }
          }
        }
      } catch (error) {
        console.error('Error fetching Stripe session:', error)
        // Continue without Stripe customer ID
      }
    }

    // Create or update user account
    const { user, isNewUser } = await createUserAccount(db, email.toLowerCase(), loginMethod, stripeCustomerId || undefined)

    // If we found a Stripe customer ID but the user already exists, update it
    if (stripeCustomerId && !isNewUser) {
      await updateStripeCustomerId(db, email.toLowerCase(), stripeCustomerId)
    }

    // Generate JWT token
    const jwtSecret = env.JWT_SECRET
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: 'JWT secret not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const jwtToken = await signJwt(
      {
        sub: user.id.toString(),
        email: user.email,
        login_method: loginMethod,
      },
      jwtSecret,
      7 * 24 * 60 * 60 // 7 days
    )

    // Set cookie with appropriate security settings
    const isProduction = env.SITE_URL?.startsWith('https://') || false
    const secureFlag = isProduction ? 'Secure; ' : ''
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': `auth-token=${jwtToken}; HttpOnly; Path=/; ${secureFlag}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    })

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        subscription_status: user.subscription_status
      },
      isNewUser
    }), {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Error creating user account:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
