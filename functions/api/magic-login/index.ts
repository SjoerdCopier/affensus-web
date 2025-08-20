async function signJwt(payload: any, secret: string, expiresIn: number): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + expiresIn
  
  const jwtPayload = { ...payload, iat: now, exp }
  
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadB64 = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const signatureArrayBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${headerB64}.${payloadB64}`)
  )
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signatureArrayBuffer)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  return `${headerB64}.${payloadB64}.${signatureB64}`
}

async function getMagicLinkByToken(db: any, token: string) {
  return await db.prepare(`
    SELECT * FROM magic_links 
    WHERE token = ? AND used_at IS NULL AND expires_at > datetime('now')
  `).bind(token).first()
}

async function markMagicLinkAsUsed(db: any, token: string) {
  await db.prepare(`
    UPDATE magic_links 
    SET used_at = datetime('now')
    WHERE token = ?
  `).bind(token).run()
}

async function getUserByEmail(db: any, email: string) {
  return await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
}

async function updatePreferredLoginMethod(db: any, email: string, method: string) {
  await db.prepare(`
    UPDATE users 
    SET preferred_login_method = ?, updated_at = datetime('now')
    WHERE email = ?
  `).bind(method, email).run()
}

async function processPendingPayments(db: any, email: string, userId: number, stripeSecretKey?: string) {
  try {
    // Check for pending payments for this email
    const pendingPayments = await db.prepare(`
      SELECT * FROM pending_payments 
      WHERE email = ? AND processed = 0
    `).bind(email).all()

    if (pendingPayments.results && pendingPayments.results.length > 0) {
      console.log(`Found ${pendingPayments.results.length} pending payment(s) for ${email}`)
      
      for (const payment of pendingPayments.results) {
        try {
          if (stripeSecretKey) {
            // Get the session details from Stripe
            const sessionResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${payment.session_id}`, {
              headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
              },
            })

            if (sessionResponse.ok) {
              const session = await sessionResponse.json()
              
              // Create Stripe customer for this user
              const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${stripeSecretKey}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  email: email,
                  name: payment.customer_name || 'Customer',
                  'metadata[user_id]': userId.toString(),
                  'metadata[session_id]': payment.session_id,
                }),
              })

              if (customerResponse.ok) {
                const customer = await customerResponse.json()
                
                // Update user with Stripe customer ID
                await db.prepare(`
                  UPDATE users 
                  SET stripe_customer_id = ?, updated_at = datetime('now')
                  WHERE id = ?
                `).bind(customer.id, userId).run()
                
                // Import the functions from webhook (we'll need to refactor this)
                // For now, let's create a simple subscription update
                let subscriptionStatus = 'free'
                if (payment.amount_total === 1999) subscriptionStatus = 'basic'
                else if (payment.amount_total === 3999) subscriptionStatus = 'active'
                else if (payment.amount_total === 7900) subscriptionStatus = 'lifetime'
                
                await db.prepare(`
                  UPDATE users 
                  SET 
                    subscription_status = ?, 
                    subscription_expires_at = datetime('now', '+1 year'),
                    updated_at = datetime('now')
                  WHERE id = ?
                `).bind(subscriptionStatus, userId).run()
                
                console.log(`Processed pending payment for user ${userId}, customer ${customer.id}`)
              }
            }
          }
          
          // Mark payment as processed
          await db.prepare(`
            UPDATE pending_payments 
            SET processed = 1 
            WHERE id = ?
          `).bind(payment.id).run()
          
        } catch (error) {
          console.error('Error processing pending payment:', error)
        }
      }
    }
  } catch (error) {
    console.error('Error checking for pending payments:', error)
  }
}

export async function onRequestGet(context: any) {
  try {
    const { request, env } = context
    const url = new URL(request.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=missing_token` }
      })
    }

    // Get database from environment
    const db = env.DB
    if (!db) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=database_not_available` }
      })
    }

    try {
      // Find magic link
      const magicLink = await getMagicLinkByToken(db, token)
      
      if (!magicLink) {
        return new Response(null, {
          status: 302,
          headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=invalid_or_expired_token` }
        })
      }

      // Mark magic link as used
      await markMagicLinkAsUsed(db, token)

      // Get user
      const user = await getUserByEmail(db, magicLink.email)
      if (!user) {
        return new Response(null, {
          status: 302,
          headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=user_not_found` }
        })
      }

      // Update user's preferred login method
      await updatePreferredLoginMethod(db, user.email, 'magic_link')

      // Check for pending payments after user login
      await processPendingPayments(db, user.email, user.id, env.STRIPE_SECRET_KEY)

      // Generate JWT token
      const jwtSecret = env.JWT_SECRET
      if (!jwtSecret) {
        return new Response(null, {
          status: 302,
          headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=jwt_not_configured` }
        })
      }

      const jwtToken = await signJwt(
        {
          sub: user.id.toString(),
          email: user.email,
          login_method: 'magic_link',
        },
        jwtSecret,
        7 * 24 * 60 * 60 // 7 days
      )

      // Create HTML response with localStorage and redirect
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Redirecting...</title>
        </head>
        <body>
          <script>
            localStorage.setItem('lastLoginMethod', 'magic_link');
            localStorage.setItem('lastLoginTime', new Date().toISOString());
            window.location.href = '${env.SITE_URL || 'http://localhost:3000'}/auth';
          </script>
          <p>Redirecting...</p>
        </body>
        </html>
      `
      
      // Set cookie with appropriate security settings
      const isProduction = env.SITE_URL?.startsWith('https://') || false
      const cookieFlags = `HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`
      const cookieHeader = `auth-token=${jwtToken}; ${cookieFlags}`
      
      console.log('🍪 Setting cookie:', cookieHeader)
      console.log('🔑 JWT Token (first 20 chars):', jwtToken.substring(0, 20))
      console.log('📍 Is Production:', isProduction)
      
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Set-Cookie': cookieHeader
        },
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=database_error` }
      })
    }

  } catch (error) {
    console.error('Error processing magic login:', error)
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${context.env.SITE_URL || 'http://localhost:3000'}/auth?error=internal_error` }
    })
  }
} 