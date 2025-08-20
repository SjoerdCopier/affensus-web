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
      const payload = await verifyJwt(token, jwtSecret)
      if (!payload) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const { description, userEmail, subscriptionStatus } = await request.json()

      // Validate required fields
      if (!description) {
        return new Response(JSON.stringify({ 
          error: "Description is required" 
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

      // Get user's payment information from database
      const db = env.DB
      if (!db) {
        return new Response(JSON.stringify({ error: 'Database not available' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Get user's most recent paid invoice
      const userInvoices = await db.prepare(`
        SELECT * FROM stripe_invoices 
        WHERE user_id = ? AND status = 'paid' AND amount_paid > 0
        ORDER BY created_at DESC 
        LIMIT 1
      `).bind(payload.sub).all()

      if (!userInvoices.results || userInvoices.results.length === 0) {
        return new Response(JSON.stringify({ 
          error: "No payment found to refund" 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const latestInvoice = userInvoices.results[0]

      // Check if refund is within 7 days
      const paymentDate = new Date(latestInvoice.created_at)
      const now = new Date()
      const daysSincePayment = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSincePayment > 7) {
        return new Response(JSON.stringify({ 
          error: "Refund window has expired. Refunds are only available within 7 days of payment." 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Check if this is a manually created invoice (fake Stripe ID)
      if (latestInvoice.stripe_invoice_id.startsWith('manual_fix_')) {
        // For manually created invoices, just update subscription status without Stripe refund
        await db.prepare(`
          UPDATE users 
          SET subscription_status = 'free', 
              subscription_expires_at = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ?
        `).bind(payload.sub).run()

        // Create credit note for the refund
        const { createCreditNote } = await import('../../../src/lib/invoice-generator.js')
        const creditNote = await createCreditNote(db, latestInvoice.id, description)

        // Log the manual refund
        console.log(`Manual refund processed for user ${payload.sub}:`, {
          userId: payload.sub,
          userEmail: userEmail || payload.email,
          amountRefunded: latestInvoice.amount_paid,
          currency: latestInvoice.currency,
          refundReason: description,
          timestamp: new Date().toISOString()
        })

        // Send email notification for refund request
        const resendApiKey = env.RESEND_API_KEY
        if (resendApiKey) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'MorseXpress <noreply@email.morsexpress.com>',
                to: 'info@sjoerdcopier.nl',
                subject: 'Refund Request - MorseXpress',
                html: `
                  <h2>Refund Request Processed</h2>
                  <p><strong>User:</strong> ${userEmail || payload.email}</p>
                  <p><strong>User ID:</strong> ${payload.sub}</p>
                  <p><strong>Amount Refunded:</strong> $${(latestInvoice.amount_paid / 100).toFixed(2)} ${latestInvoice.currency.toUpperCase()}</p>
                  <p><strong>Refund Reason:</strong> ${description}</p>
                  <p><strong>Processed:</strong> ${new Date().toISOString()}</p>
                  <p><strong>Type:</strong> Manual refund (testing environment)</p>
                `
              }),
            })
            console.log('Refund notification email sent')
          } catch (emailError) {
            console.error('Failed to send refund notification email:', emailError)
          }
        }

        return new Response(JSON.stringify({ 
          message: `Refund processed successfully! $${(latestInvoice.amount_paid / 100).toFixed(2)} has been refunded. Your subscription has been cancelled.`,
          amountRefunded: latestInvoice.amount_paid,
          currency: latestInvoice.currency,
          note: "This was a manual refund for testing purposes."
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Process refund through Stripe for real payments
      const stripeSecretKey = env.STRIPE_SECRET_KEY
      if (!stripeSecretKey) {
        return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      try {
        // Create refund through Stripe API
        const refundResponse = await fetch('https://api.stripe.com/v1/refunds', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            payment_intent: latestInvoice.stripe_invoice_id,
            reason: 'requested_by_customer',
            metadata: JSON.stringify({
              user_id: payload.sub,
              user_email: userEmail || payload.email,
              refund_reason: description,
              refund_date: new Date().toISOString()
            })
          }),
        })

        if (!refundResponse.ok) {
          const errorData = await refundResponse.json()
          console.error('Stripe refund error:', errorData)
          return new Response(JSON.stringify({ 
            error: "Failed to process refund through Stripe" 
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        const refund = await refundResponse.json()

        // Update user subscription status to free
        await db.prepare(`
          UPDATE users 
          SET subscription_status = 'free', 
              subscription_expires_at = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ?
        `).bind(payload.sub).run()

        // Create credit note for the refund
        const { createCreditNote } = await import('../../../src/lib/invoice-generator.js')
        const creditNote = await createCreditNote(db, latestInvoice.id, description)

        // Log the successful refund
        console.log(`Refund processed for user ${payload.sub}:`, {
          userId: payload.sub,
          userEmail: userEmail || payload.email,
          stripeRefundId: refund.id,
          amountRefunded: latestInvoice.amount_paid,
          currency: latestInvoice.currency,
          refundReason: description,
          timestamp: new Date().toISOString()
        })

        // Send email notification for refund request
        const resendApiKey = env.RESEND_API_KEY
        if (resendApiKey) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'MorseXpress <noreply@morsexpress.com>',
                to: 'info@sjoerdcopier.nl',
                subject: 'Refund Request - MorseXpress',
                html: `
                  <h2>Refund Request Processed</h2>
                  <p><strong>User:</strong> ${userEmail || payload.email}</p>
                  <p><strong>User ID:</strong> ${payload.sub}</p>
                  <p><strong>Stripe Refund ID:</strong> ${refund.id}</p>
                  <p><strong>Amount Refunded:</strong> $${(latestInvoice.amount_paid / 100).toFixed(2)} ${latestInvoice.currency.toUpperCase()}</p>
                  <p><strong>Refund Reason:</strong> ${description}</p>
                  <p><strong>Processed:</strong> ${new Date().toISOString()}</p>
                  <p><strong>Type:</strong> Stripe refund (production)</p>
                `
              }),
            })
            console.log('Refund notification email sent')
          } catch (emailError) {
            console.error('Failed to send refund notification email:', emailError)
          }
        }

        return new Response(JSON.stringify({ 
          message: `Refund processed successfully! $${(latestInvoice.amount_paid / 100).toFixed(2)} has been refunded to your original payment method. Your subscription has been cancelled.`,
          refundId: refund.id,
          amountRefunded: latestInvoice.amount_paid,
          currency: latestInvoice.currency
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      } catch (stripeError) {
        console.error('Error processing Stripe refund:', stripeError)
        return new Response(JSON.stringify({ 
          error: "Failed to process refund. Please contact support." 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

    } catch (jwtError) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error processing refund request:', error)
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
