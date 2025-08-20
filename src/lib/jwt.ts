// Edge-compatible JWT utilities using Web Crypto API
// No Node.js dependencies, works in Cloudflare Workers/Pages

const JWT_ALGORITHM = 'HS256'
const JWT_HEADER = { alg: JWT_ALGORITHM, typ: 'JWT' }

export interface JWTPayload {
  sub: string // user ID
  email: string
  login_method?: string // login method used (email, google, etc.)
  iat: number // issued at
  exp: number // expiration
}

export interface User {
  id: string
  email: string
  login_method?: string
}

export async function signJwt(payload: Omit<JWTPayload, 'iat' | 'exp'>, secret: string, expiresIn: number = 7 * 24 * 60 * 60): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const jwtPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  }

  const headerB64 = btoa(JSON.stringify(JWT_HEADER))
  const payloadB64 = btoa(JSON.stringify(jwtPayload))
  const data = `${headerB64}.${payloadB64}`

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

  return `${data}.${signatureB64}`
}

export async function verifyJwt(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [headerB64, payloadB64, signatureB64] = parts
    const data = `${headerB64}.${payloadB64}`

    // Verify signature
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0))
    const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data))

    if (!isValid) {
      return null
    }

    // Parse payload
    const payload = JSON.parse(atob(payloadB64)) as JWTPayload

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Validate JWT and return payload (alias for verifyJwt for consistency)
 */
export async function validateJWT(token: string, secret: string): Promise<JWTPayload> {
  const payload = await verifyJwt(token, secret)
  if (!payload) {
    throw new Error('Invalid or expired JWT token')
  }
  return payload
}

/**
 * Extract user information from JWT payload
 */
export async function getUserFromToken(payload: JWTPayload): Promise<User> {
  // In a real implementation, you might want to fetch additional user data from database
  // For now, we'll just return the basic info from the token
  return {
    id: payload.sub,
    email: payload.email,
    login_method: payload.login_method,
  }
}

export function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
} 