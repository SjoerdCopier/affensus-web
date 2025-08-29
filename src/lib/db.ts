// D1 Database utilities for authentication

// Type definition for Cloudflare D1 Database
interface D1Database {
  prepare(query: string): D1PreparedStatement
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first(): Promise<unknown>
  all(): Promise<{ results: unknown[] }>
  run(): Promise<{ meta: { changes: number } }>
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

// Network Monitor interfaces
export interface NetworkMonitor {
  id: number
  user_id: string
  domain: string
  display_name?: string
  enabled: boolean
  created_at: string
  updated_at: string
  last_check_at?: string
  last_status?: boolean
  last_response_time?: number
  notification_enabled: boolean
  check_interval_minutes: number
}

export interface CreateNetworkMonitor {
  user_id: string
  domain: string
  display_name?: string
  enabled?: boolean
  notification_enabled?: boolean
  check_interval_minutes?: number
}

export interface UpdateNetworkMonitor {
  enabled?: boolean
  display_name?: string
  notification_enabled?: boolean
  check_interval_minutes?: number
  last_check_at?: string
  last_status?: boolean
  last_response_time?: number
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

// Network Monitor functions
export async function createNetworkMonitor(db: D1Database, data: CreateNetworkMonitor): Promise<NetworkMonitor> {
  const result = await db.prepare(`
    INSERT INTO network_monitors (user_id, domain, display_name, enabled, notification_enabled, check_interval_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    data.user_id,
    data.domain,
    data.display_name || null,
    data.enabled ?? 1,
    data.notification_enabled ?? 1,
    data.check_interval_minutes ?? 5
  ).first() as NetworkMonitor
  
  if (!result) {
    throw new Error('Failed to create network monitor')
  }
  
  return result
}

export async function getUserMonitors(db: D1Database, userId: string): Promise<NetworkMonitor[]> {
  const result = await db.prepare(`
    SELECT * FROM network_monitors 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `).bind(userId).all() as { results: NetworkMonitor[] }
  
  return result.results
}

export async function getMonitorById(db: D1Database, id: number, userId: string): Promise<NetworkMonitor | null> {
  const result = await db.prepare(`
    SELECT * FROM network_monitors 
    WHERE id = ? AND user_id = ?
  `).bind(id, userId).first() as NetworkMonitor | null
  
  return result
}

export async function updateMonitor(db: D1Database, id: number, userId: string, data: UpdateNetworkMonitor): Promise<NetworkMonitor | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];

  // Build dynamic SET clause
  if (data.enabled !== undefined) {
    setClauses.push(`enabled = ?`);
    values.push(data.enabled ? 1 : 0);
  }
  if (data.display_name !== undefined) {
    setClauses.push(`display_name = ?`);
    values.push(data.display_name);
  }
  if (data.notification_enabled !== undefined) {
    setClauses.push(`notification_enabled = ?`);
    values.push(data.notification_enabled ? 1 : 0);
  }
  if (data.check_interval_minutes !== undefined) {
    setClauses.push(`check_interval_minutes = ?`);
    values.push(data.check_interval_minutes);
  }
  if (data.last_check_at !== undefined) {
    setClauses.push(`last_check_at = ?`);
    values.push(data.last_check_at);
  }
  if (data.last_status !== undefined) {
    setClauses.push(`last_status = ?`);
    values.push(data.last_status ? 1 : 0);
  }
  if (data.last_response_time !== undefined) {
    setClauses.push(`last_response_time = ?`);
    values.push(data.last_response_time);
  }

  if (setClauses.length === 0) {
    return null; // No updates to make
  }

  const query = `
    UPDATE network_monitors 
    SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
    RETURNING *
  `;
  
  values.push(id, userId);
  const result = await db.prepare(query).bind(...values).first() as NetworkMonitor | null;
  return result
}

export async function deleteMonitor(db: D1Database, id: number, userId: string): Promise<boolean> {
  const result = await db.prepare(`
    DELETE FROM network_monitors 
    WHERE id = ? AND user_id = ?
  `).bind(id, userId).run();
  
  return result.meta.changes > 0;
}

export async function monitorExists(db: D1Database, userId: string, domain: string): Promise<boolean> {
  const result = await db.prepare(`
    SELECT COUNT(*) as count FROM network_monitors 
    WHERE user_id = ? AND domain = ?
  `).bind(userId, domain).first() as { count: number } | null;
  
  return (result?.count ?? 0) > 0;
}

export async function getEnabledMonitors(db: D1Database): Promise<NetworkMonitor[]> {
  const result = await db.prepare(`
    SELECT * FROM network_monitors 
    WHERE enabled = 1 
    ORDER BY last_check_at ASC NULLS FIRST
  `).all() as { results: NetworkMonitor[] }
  
  return result.results;
}

export function generateToken(): string {
  // Use Web API crypto instead of Node.js crypto for edge runtime compatibility
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
} 