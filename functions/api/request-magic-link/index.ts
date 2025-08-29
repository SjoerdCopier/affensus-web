// D1 Database utilities for authentication
function generateToken(): string {
  // Use Web API crypto instead of Node.js crypto for edge runtime compatibility
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

async function createUser(db: any, email: string, loginMethod: string = 'magic_link') {
  // Use external API instead of D1
  const bearerToken = process.env.AFFENSUS_CREDENTIALS_PASSWORD;
  if (!bearerToken) {
    throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
  }

  console.log('Registering user via external API:', { email, loginMethod });

  const response = await fetch('https://apiv2.affensus.com/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      email: email.toLowerCase(),
      name: null, // Magic link users don't have names initially
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

async function createMagicLink(db: any, email: string, token: string) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  const stmt = db.prepare(`
    INSERT INTO magic_links (email, token, expires_at, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `)
  await stmt.bind(email, token, expiresAt.toISOString()).run()
}

async function cleanupExpiredMagicLinks(db: any) {
  await db.prepare('DELETE FROM magic_links WHERE expires_at < datetime("now")').run()
}

async function sendMagicLinkEmail(email: string, magicLinkUrl: string, resendApiKey: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@email.morsexpress.com',
      to: email,
      subject: 'Your Magic Link for MorseXpress',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin-bottom: 10px;">MorseXpress</h1>
            <h2 style="color: #4b5563; font-weight: normal; margin-top: 0;">Your Magic Link</h2>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            Click the button below to sign in to your MorseXpress account. This link will expire in 10 minutes.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" 
               style="background-color: #1f2937; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Sign In to MorseXpress
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
            ${magicLinkUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>
      `,
      text: `
Your Magic Link for MorseXpress

Click the following link to sign in to your MorseXpress account. This link will expire in 10 minutes.

${magicLinkUrl}

If you didn't request this email, you can safely ignore it.
      `.trim()
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Resend API error:', errorText)
    throw new Error(`Failed to send email via Resend: ${response.status} ${errorText}`)
  }

  return await response.json()
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context
    const { email } = await request.json()

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get database from environment
    const db = env.DB
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      // Clean up expired magic links
      await cleanupExpiredMagicLinks(db)

      // Create or update user
      const { user, isNewUser } = await createUser(db, email.toLowerCase(), 'magic_link')

      // Send email notification for new users
      if (isNewUser) {
        const resendApiKey = env.RESEND_API_KEY
        if (resendApiKey) {
          try {
            const { sendNewUserNotification } = await import('../auth/shared/email-notifications')
            await sendNewUserNotification(user.email, 'magic_link', resendApiKey)
          } catch (error) {
            console.error('Failed to send new user notification:', error)
            // Continue with normal flow even if email fails
          }
        } else {
          console.log('New user registered but RESEND_API_KEY not configured - email notification skipped')
        }
      }

      // Generate magic link token
      const token = generateToken()

      // Store magic link in database
      await createMagicLink(db, email.toLowerCase(), token)

      // Create magic link URL
      const magicLinkUrl = `${env.SITE_URL || 'http://localhost:3000'}/api/magic-login?token=${token}`

      // For development mode, return the magic link
      if (env.NODE_ENV === 'development') {
        console.log(`[DEV] 🔗 Magic link for ${email}: ${magicLinkUrl}`)
        return new Response(JSON.stringify({ 
          message: 'Magic link generated',
          development_link: magicLinkUrl
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Check if Resend API key is available
      const resendApiKey = env.RESEND_API_KEY
      if (!resendApiKey) {
        console.error('RESEND_API_KEY not configured')
        return new Response(JSON.stringify({ error: 'Email service not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Send email with magic link using Resend
      try {
        const emailResult = await sendMagicLinkEmail(email, magicLinkUrl, resendApiKey)
        console.log(`Magic link email sent to ${email}:`, emailResult)

        return new Response(JSON.stringify({ 
          message: 'Magic link sent to your email' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (emailError) {
        console.error('Failed to send magic link email:', emailError)
        return new Response(JSON.stringify({ error: 'Failed to send email' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

    } catch (dbError) {
      console.error('Database error:', dbError)
      return new Response(JSON.stringify({ error: 'Database operation failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error processing magic link request:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 