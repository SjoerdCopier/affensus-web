export async function onRequestGet(context: any) {
  try {
    const { request, env } = context
    
    const FACEBOOK_APP_ID = env.FACEBOOK_APP_ID
    const FACEBOOK_REDIRECT_URI = `${env.SITE_URL || 'http://localhost:3000'}/api/auth/facebook/callback`

    if (!FACEBOOK_APP_ID) {
      console.error('FACEBOOK_APP_ID not configured')
      return new Response(JSON.stringify({ error: 'Facebook OAuth not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Generate state parameter for CSRF protection
    const state = Math.random().toString(36).substring(2, 15)
    
    // Create OAuth URL
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('email')}&` +
      `state=${state}`

    // Create response with redirect and state cookie
    const response = new Response(null, {
      status: 302,
      headers: {
        'Location': authUrl,
        'Set-Cookie': `oauth_state=${state}; HttpOnly; ${env.SITE_URL?.startsWith('https://') ? 'Secure; ' : ''}SameSite=Lax; Max-Age=600; Path=/`
      }
    })

    return response

  } catch (error) {
    console.error('Error initiating Facebook OAuth:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 