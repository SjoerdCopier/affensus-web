export async function onRequestPost(context: any) {
  try {
    const { request, env } = context
    const { 
      category, 
      word, 
      morseCode, 
      description, 
      userEmail,
      locale = 'en'
    } = await request.json()

    // Validate required fields
    if (!category || !word || !description) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate category
    const validCategories = [
      'animals', 'basic-needs', 'colors', 'commands', 'communication',
      'countries', 'emergency', 'family-friends', 'farewells', 'fashion',
      'feel-good-words', 'feelings', 'food-drink', 'greetings',
      'inspirational-motivational', 'internet-slang', 'military-tactical',
      'nature', 'navigation', 'occupations', 'questions', 'responses',
      'romantic-personal', 'sports-games', 'tattoo', 'technology',
      'travel-transport', 'tv-games', 'weather'
    ]

    if (!validCategories.includes(category)) {
      return new Response(JSON.stringify({ 
        error: "Invalid category" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Basic validation
    if (description.length > 1000) {
      return new Response(JSON.stringify({ 
        error: "Description too long (max 1000 characters)" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Log the mistake report (in production, you'd save to database or send notification)
    console.log(`Mistake report for ${category}/${word}:`, {
      category,
      word,
      morseCode,
      description: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
      userEmail,
      locale,
      timestamp: new Date().toISOString()
    })

    // TODO: Implement actual database storage or notification system
    // For now, we'll just return success

    return new Response(JSON.stringify({ 
      message: "Thank you for reporting this issue. We'll review it and make corrections if necessary." 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error processing mistake report:', error)
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 