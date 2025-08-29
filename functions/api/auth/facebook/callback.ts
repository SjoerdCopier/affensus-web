interface FacebookUserInfo {
  id: string
  email: string
  name: string
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

export async function onRequestGet(context: any) {
  try {
    const { request, env } = context
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    const FACEBOOK_APP_ID = env.FACEBOOK_APP_ID
    const FACEBOOK_APP_SECRET = env.FACEBOOK_APP_SECRET
    const FACEBOOK_REDIRECT_URI = `${env.SITE_URL || 'http://localhost:3000'}/api/auth/facebook/callback`

    // Check for OAuth errors
    if (error) {
      console.error('Facebook OAuth error:', error)
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=oauth_denied` }
      })
    }

    // Verify required parameters
    if (!code || !state) {
      console.error('Missing code or state parameter')
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=invalid_request` }
      })
    }

    // Verify state parameter for CSRF protection
    const cookies = parseCookies(request.headers.get('Cookie'))
    const storedState = cookies['oauth_state']
    if (!storedState || state !== storedState) {
      console.error('Invalid state parameter')
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=invalid_state` }
      })
    }

    // Check if OAuth is configured
    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      console.error('Facebook OAuth not configured')
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=oauth_not_configured` }
      })
    }

    // Exchange code for access token
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `client_secret=${FACEBOOK_APP_SECRET}&` +
      `code=${code}&` +
      `redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}`)

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', await tokenResponse.text())
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=token_exchange_failed` }
      })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get user info from Facebook
    const userInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`
    )

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info from Facebook')
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=user_info_failed` }
      })
    }

    const userInfo: FacebookUserInfo = await userInfoResponse.json()

    // Verify email is provided
    if (!userInfo.email) {
      console.error('Facebook account email not provided')
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

    // Create or update user with Facebook login method
    const createUser = async (db: any, email: string, loginMethod: string = 'facebook') => {
      // Use external API instead of D1
      const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
      if (!bearerToken) {
        throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
      }

      // Get user name from Facebook user info
      const name = userInfo.name || null;

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
    const { user, isNewUser } = await createUser(db, userInfo.email.toLowerCase(), 'facebook')

    // Update user's preferred login method
    await updatePreferredLoginMethod(db, userInfo.email.toLowerCase(), 'facebook')

    // Send email notification for new users
    if (isNewUser) {
      const resendApiKey = env.RESEND_API_KEY
      if (resendApiKey) {
        try {
          const { sendNewUserNotification } = await import('../shared/email-notifications')
          await sendNewUserNotification(user.email, 'facebook', resendApiKey)
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
        login_method: 'facebook',
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
          localStorage.setItem('lastLoginMethod', 'facebook');
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
    console.error('Error processing Facebook OAuth callback:', error)
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${context.env.SITE_URL || 'http://localhost:3000'}/auth?error=internal_error` }
    })
  }
} 