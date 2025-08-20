import { verifyJwt } from '../../../src/lib/jwt'

async function getUserInvoices(db: any, userId: string) {
  return await db.prepare(`
    SELECT * FROM stripe_invoices 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `).bind(userId).all()
}

// GET - Get user invoices
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
        token = authCookie.split('=')[1]
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

      const invoicesResult = await getUserInvoices(db, decoded.sub)
      const invoices = invoicesResult.results || []

      // Format invoices for frontend
      const formattedInvoices = invoices.map((invoice: any) => ({
        id: invoice.id.toString(),
        stripeInvoiceId: invoice.stripe_invoice_id,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        description: invoice.description,
        invoiceUrl: invoice.invoice_url,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        periodStart: invoice.period_start,
        periodEnd: invoice.period_end,
        createdAt: invoice.created_at,
        // New invoice fields
        invoiceNumber: invoice.invoice_number,
        invoiceType: invoice.invoice_type,
        invoiceDate: invoice.invoice_date,
        totalAmount: invoice.total_amount,
        creditNoteForInvoiceId: invoice.credit_note_for_invoice_id
      }))

      return new Response(JSON.stringify({
        invoices: formattedInvoices
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
    console.error('Error getting user invoices:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 