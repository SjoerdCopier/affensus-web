// D1 Database utilities for authentication

// Type definition for Cloudflare D1 Database
interface D1Database {
  prepare(query: string): D1PreparedStatement
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first(): Promise<unknown>
  all(): Promise<{ results: unknown[] }>
  run(): Promise<unknown>
}

export interface User {
  id: number
  email: string
  preferred_login_method: string
  created_at: string
  updated_at: string
}

export interface MagicLink {
  id: number
  email: string
  token: string
  expires_at: string
  used_at: string | null
  created_at: string
}

export async function createUser(db: D1Database, email: string, loginMethod: string = 'email'): Promise<User> {
  const result = await db.prepare(`
    INSERT INTO users (email, preferred_login_method) 
    VALUES (?, ?) 
    ON CONFLICT(email) DO UPDATE SET 
      updated_at = CURRENT_TIMESTAMP,
      preferred_login_method = ?
    RETURNING *
  `).bind(email, loginMethod, loginMethod).first() as User
  
  if (!result) {
    throw new Error('Failed to create user')
  }
  
  return result
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const result = await db.prepare(`
    SELECT * FROM users WHERE email = ?
  `).bind(email).first() as User | null
  
  return result || null
}

export async function updatePreferredLoginMethod(db: D1Database, email: string, loginMethod: string): Promise<void> {
  await db.prepare(`
    UPDATE users 
    SET preferred_login_method = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE email = ?
  `).bind(loginMethod, email).run()
}

export async function createMagicLink(db: D1Database, email: string, token: string, expiresAt: string): Promise<MagicLink> {
  const result = await db.prepare(`
    INSERT INTO magic_links (email, token, expires_at) 
    VALUES (?, ?, ?) 
    RETURNING *
  `).bind(email, token, expiresAt).first() as MagicLink
  
  if (!result) {
    throw new Error('Failed to create magic link')
  }
  
  return result
}

export async function getMagicLinkByToken(db: D1Database, token: string): Promise<MagicLink | null> {
  const result = await db.prepare(`
    SELECT * FROM magic_links 
    WHERE token = ? AND expires_at > datetime('now') AND used_at IS NULL
  `).bind(token).first() as MagicLink | null
  
  return result || null
}

export async function markMagicLinkAsUsed(db: D1Database, token: string): Promise<void> {
  await db.prepare(`
    UPDATE magic_links 
    SET used_at = CURRENT_TIMESTAMP 
    WHERE token = ?
  `).bind(token).run()
}

export async function cleanupExpiredMagicLinks(db: D1Database): Promise<void> {
  await db.prepare(`
    DELETE FROM magic_links 
    WHERE expires_at < datetime('now')
  `).run()
}

export function generateToken(): string {
  // Use Web API crypto instead of Node.js crypto for edge runtime compatibility
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
} 