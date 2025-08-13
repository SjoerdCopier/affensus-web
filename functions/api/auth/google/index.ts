export async function onRequestGet(context: any) {
  try {
    const { request, env } = context
    
    const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID
    const GOOGLE_REDIRECT_URI = `${env.SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`

    if (!GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID not configured')
      return new Response(JSON.stringify({ error: 'Google OAuth not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Generate state parameter for CSRF protection
    const state = Math.random().toString(36).substring(2, 15)
    
    // Create OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`

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
    console.error('Error initiating Google OAuth:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 