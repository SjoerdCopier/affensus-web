import { verifyJwt } from '../../../src/lib/jwt'

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context
    
    // Get JWT token from cookie
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
      const payload = await verifyJwt(token, jwtSecret)
      if (!payload) {
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

      // Import invoice generator functions
      const { processPendingInvoices } = await import('../../../src/lib/invoice-generator.js')

      // Process pending invoices for this user
      const createdInvoices = await processPendingInvoices(db, parseInt(payload.sub), payload.email)

      return new Response(JSON.stringify({ 
        success: true,
        invoicesCreated: createdInvoices.length,
        invoices: createdInvoices.map(inv => ({
          invoiceNumber: inv.invoiceNumber,
          amount: inv.totalAmount,
          currency: inv.currency
        }))
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (jwtError) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error processing pending invoices:', error)
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
