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

async function getMagicLinkByToken(token: string, apiKey: string) {
  try {
    const response = await fetch(`https://apiv2.affensus.com/api/auth/magic-link/${token}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // Magic link not found
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Check if magic link is valid (not used and not expired)
    if (data.used || new Date(data.expires_at) <= new Date()) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching magic link:', error)
    return null
  }
}

async function markMagicLinkAsUsed(token: string, apiKey: string) {
  try {
    const response = await fetch(`https://apiv2.affensus.com/api/auth/magic-link/${token}/use`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to mark magic link as used: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('Error marking magic link as used:', error)
    return false
  }
}

async function getUserByEmail(email: string, apiKey: string) {
  try {
    const response = await fetch(`https://apiv2.affensus.com/api/auth/user/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // User not found
      }
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

async function updatePreferredLoginMethod(email: string, method: string, apiKey: string) {
  try {
    const response = await fetch(`https://apiv2.affensus.com/api/auth/user/preferred-login-method`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        method: method
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update login method: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('Error updating preferred login method:', error)
    return false
  }
}

async function processPendingPayments(email: string, userId: number, stripeSecretKey?: string) {
  try {
    // Note: This function still contains D1 database calls for pending payments
    // This will need to be migrated to the API as well in a future update
    console.log(`Processing pending payments for user ${userId} (${email})`)
    
    // TODO: Migrate pending payments to external API
    // For now, we'll skip this functionality to avoid D1 dependencies
    
  } catch (error) {
    console.error('Error processing pending payments:', error)
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

    // Get API key from environment
    const apiKey = env.AFFENSUS_CREDENTIALS_PASSWORD
    if (!apiKey) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=api_not_configured` }
      })
    }

    try {
      // Find magic link via API
      const magicLink = await getMagicLinkByToken(token, apiKey)
      
      if (!magicLink) {
        return new Response(null, {
          status: 302,
          headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=invalid_or_expired_token` }
        })
      }

      // Mark magic link as used via API
      const markedAsUsed = await markMagicLinkAsUsed(token, apiKey)
      if (!markedAsUsed) {
        console.error('Failed to mark magic link as used')
        // Continue anyway to avoid blocking the user
      }

      // Get user via API
      const user = await getUserByEmail(magicLink.email, apiKey)
      if (!user) {
        return new Response(null, {
          status: 302,
          headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=user_not_found` }
        })
      }

      // Update user's preferred login method via API
      const loginMethodUpdated = await updatePreferredLoginMethod(user.email, 'magic_link', apiKey)
      if (!loginMethodUpdated) {
        console.error('Failed to update preferred login method')
        // Continue anyway to avoid blocking the user
      }

      // Check for pending payments after user login
      await processPendingPayments(user.email, user.id, env.STRIPE_SECRET_KEY)

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

    } catch (apiError) {
      console.error('API error:', apiError)
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=api_error` }
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