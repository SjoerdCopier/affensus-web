import { verifyJwt } from '../../../src/lib/jwt'

async function getUserPreferences(db: any, userId: string) {
  return await db.prepare(`
    SELECT * FROM user_preferences 
    WHERE user_id = ?
  `).bind(userId).first()
}

async function createDefaultPreferences(db: any, userId: string) {
  await db.prepare(`
    INSERT INTO user_preferences (user_id, speed_preference, audio_enabled, notifications_enabled, theme, language)
    VALUES (?, 20, 1, 1, 'light', 'en')
  `).bind(userId).run()
  
  return await getUserPreferences(db, userId)
}

// GET - Get user preferences
export async function onRequestGet(context: any) {
  try {
    const { request, env } = context
    
    // Get JWT token from cookie (same logic as /api/user)
    const cookieHeader = request.headers.get('Cookie')
    let token: string | null = null
    
    if (cookieHeader) {
      const cookies = cookieHeader.split('; ')
      const authCookie = cookies.find((c: string) => c.startsWith('auth-token='))
      if (authCookie) {
        // Handle URL encoding like in /api/user
        const encodedToken = authCookie.split('=')[1]
        token = decodeURIComponent(encodedToken)
      }
    }

    if (!token) {
      return new Response(JSON.stringify({ error: 'No authentication token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const jwtSecret = env.JWT_SECRET
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: 'JWT secret not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const decoded = await verifyJwt(token, jwtSecret)
      if (!decoded) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      const db = env.DB
      if (!db) {
        return new Response(JSON.stringify({ error: 'Database not available' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      let preferences = await getUserPreferences(db, decoded.sub)
      
      // Create default preferences if none exist
      if (!preferences) {
        preferences = await createDefaultPreferences(db, decoded.sub)
      }

      // Format preferences for frontend
      const formattedPreferences = {
        speedPreference: preferences.speed_preference,
        audioEnabled: Boolean(preferences.audio_enabled),
        notificationsEnabled: Boolean(preferences.notifications_enabled),
        theme: preferences.theme,
        language: preferences.language
      }

      return new Response(JSON.stringify({
        preferences: formattedPreferences
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (jwtError) {
      console.error('JWT Error:', jwtError)
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error getting user preferences:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 