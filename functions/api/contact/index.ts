export async function onRequestPost(context: any) {
  try {
    const { request, env } = context
    const { name, email, message } = await request.json()

    // Validate input
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Basic spam protection
    if (message.length > 5000) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Log the contact submission (in production, you'd send an email or save to database)
    console.log(`Contact form submission from ${email}:`, {
      name,
      email,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
    })

    // TODO: Implement actual email sending or database storage
    // For now, we'll just return success

    return new Response(JSON.stringify({ 
      message: "Thank you for your message. We'll get back to you soon!" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error processing contact form:', error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 