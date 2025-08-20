export async function onRequestPost(context: any) {
  const { env } = context
  
  // Set cookie clearing with appropriate security settings
  const isProduction = env.SITE_URL?.startsWith('https://') || false
  const secureFlag = isProduction ? 'Secure; ' : ''
  const clearCookieHeader = `auth-token=; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0; Path=/`
  
  console.log('🚪 Clearing auth cookie:', clearCookieHeader)
  
  const response = new Response(JSON.stringify({ message: 'Logged out successfully' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })

  // Clear the auth cookie
  response.headers.set('Set-Cookie', clearCookieHeader)

  return response
} 