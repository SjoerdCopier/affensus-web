function generateState(): string {
  // Generate a random state for CSRF protection
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function onRequestGet(context: any) {
  try {
    const { env } = context

    const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID
    const GITHUB_REDIRECT_URI = `${env.SITE_URL || 'http://localhost:3000'}/api/auth/github/callback`

    if (!GITHUB_CLIENT_ID) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${env.SITE_URL || 'http://localhost:3000'}/auth?error=oauth_not_configured` }
      })
    }

    // Generate state for CSRF protection
    const state = generateState()

    // GitHub OAuth URL
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email&state=${state}`

    return new Response(null, {
      status: 302,
      headers: {
        'Location': authUrl,
        'Set-Cookie': `oauth_state=${state}; HttpOnly; ${env.SITE_URL?.startsWith('https://') ? 'Secure; ' : ''}SameSite=Lax; Max-Age=600; Path=/`
      }
    })

  } catch (error) {
    console.error('Error initiating GitHub OAuth:', error)
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${context.env.SITE_URL || 'http://localhost:3000'}/auth?error=oauth_not_configured` }
    })
  }
} 