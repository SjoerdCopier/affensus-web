interface GitHubUserInfo {
  id: number
  login: string
  email: string
  name: string
  avatar_url: string
}

interface GitHubEmailInfo {
  email: string
  primary: boolean
  verified: boolean
  visibility: string
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (!cookieHeader) return cookies
  
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.trim().split('=')
    if (parts.length === 2) {
      // Handle URL encoding like in /api/user
      cookies[parts[0]] = decodeURIComponent(parts[1])
    }
  })
  return cookies
}

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
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('GitHub OAuth error:', error)
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=oauth_denied` }
      })
    }

    if (!code || !state) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=invalid_request` }
      })
    }

    // Verify state parameter (CSRF protection)
    const cookies = parseCookies(request.headers.get('Cookie'))
    const storedState = cookies['oauth_state']
    
    if (!storedState || storedState !== state) {
      console.error('OAuth state verification failed')
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=invalid_state` }
      })
    }

    const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID
    const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=oauth_not_configured` }
      })
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', await tokenResponse.text())
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=token_exchange_failed` }
      })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      console.error('No access token received from GitHub')
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=token_exchange_failed` }
      })
    }

    // Get user info from GitHub
    const userInfoResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MorseXpress-App'
      }
    })

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info from GitHub')
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=user_info_failed` }
      })
    }

    const userInfo: GitHubUserInfo = await userInfoResponse.json()

    // If user's email is not public, get it from the emails endpoint
    let userEmail: string | undefined = userInfo.email
    if (!userEmail) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'MorseXpress-App'
        }
      })

      if (emailsResponse.ok) {
        const emails: GitHubEmailInfo[] = await emailsResponse.json()
        const primaryEmail = emails.find(e => e.primary && e.verified)
        userEmail = primaryEmail?.email || emails.find(e => e.verified)?.email
      }
    }

    // Verify email is available
    if (!userEmail) {
      console.error('GitHub account email not available')
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=email_not_provided` }
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

    // Create or update user with GitHub login method  
    const createUser = async (db: any, email: string, loginMethod: string = 'github') => {
      // Use external API instead of D1
      const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
      if (!bearerToken) {
        throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
      }

      // Get user name from GitHub user info
      const name = userInfo.name || userInfo.login || null;

      console.log('Registering user via external API:', { email, name, loginMethod });

      const response = await fetch('https://apiv2.affensus.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name: name,
          login_method: loginMethod,
          subscription_status: 'free'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API registration failed:', response.status, errorText);
        throw new Error(`Registration failed: ${response.status} ${errorText}`);
      }

      const userData = await response.json();
      
      // For backward compatibility, return a user object that matches the expected structure
      const user = {
        id: userData.id || userData.user_id || Date.now(), // Fallback ID if API doesn't return one
        email: email.toLowerCase(),
        preferred_login_method: loginMethod,
        subscription_status: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Check if this is a new user by looking at the API response
      const isNewUser = response.status === 201; // 201 = Created, 200 = Updated
      
      return { user, isNewUser };
    }

    const updatePreferredLoginMethod = async (db: any, email: string, method: string) => {
      await db.prepare(`
        UPDATE users 
        SET preferred_login_method = ?, updated_at = datetime('now')
        WHERE email = ?
      `).bind(method, email).run()
    }

    // Create or update user
    const { user, isNewUser } = await createUser(db, userEmail!.toLowerCase(), 'github')

    // Update user's preferred login method
    await updatePreferredLoginMethod(db, userEmail!.toLowerCase(), 'github')

    // Check for pending payments after user creation/update
    await processPendingPayments(db, userEmail!.toLowerCase(), user.id, env.STRIPE_SECRET_KEY)

    // Send email notification for new users
    if (isNewUser) {
      const resendApiKey = env.RESEND_API_KEY
      if (resendApiKey) {
        try {
          const { sendNewUserNotification } = await import('../shared/email-notifications')
          await sendNewUserNotification(user.email, 'github', resendApiKey)
        } catch (error) {
          console.error('Failed to send new user notification:', error)
          // Continue with normal flow even if email fails
        }
      } else {
        console.log('New user registered but RESEND_API_KEY not configured - email notification skipped')
      }
    }

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
        login_method: 'github',
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
          localStorage.setItem('lastLoginMethod', 'github');
          localStorage.setItem('lastLoginTime', new Date().toISOString());
          window.location.href = '${env.SITE_URL || 'http://localhost:3000'}/auth';
        </script>
        <p>Redirecting...</p>
      </body>
      </html>
    `
    
    // Set cookie with appropriate security settings
    const isProduction = env.SITE_URL?.startsWith('https://') || false
    const secureFlag = isProduction ? 'Secure; ' : ''
    
    // Set cookies using Headers object for proper multiple cookie handling
    const headers = new Headers({
      'Content-Type': 'text/html'
    })
    
    // Set auth token cookie
    headers.append('Set-Cookie', `auth-token=${jwtToken}; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`)
    
    // Clear oauth_state cookie
    headers.append('Set-Cookie', `oauth_state=; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0; Path=/`)

    return new Response(html, {
      status: 200,
      headers,
    })

  } catch (error) {
    console.error('Error processing GitHub OAuth callback:', error)
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${context.env.SITE_URL || 'http://localhost:3000'}/auth?error=internal_error` }
    })
  }
} 