import { verifyJwt } from '../../../src/lib/jwt'

async function handlePaymentWithoutCustomer(db: any, session: any, stripeSecretKey: string, resendApiKey?: string) {
  try {
    const { customer_details, amount_total, currency, metadata } = session
    
    if (!customer_details?.email) {
      console.error('No customer email found in session')
      return
    }

    const email = customer_details.email.toLowerCase()
    
    // Send immediate payment confirmation email
    if (resendApiKey) {
      try {
        await sendPaymentConfirmationEmail(email, {
          amount: amount_total / 100, // Convert from cents
          currency: currency.toUpperCase(),
          sessionId: session.id
        }, resendApiKey)
        console.log(`Payment confirmation email sent to: ${email}`)
      } catch (error) {
        console.error('Failed to send payment confirmation email:', error)
      }
    }

    // Try to find existing user by email
    let user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
    
    if (user) {
      // Existing user - create/update Stripe customer and link
      console.log(`Found existing user for email: ${email}`)
      
      // Create Stripe customer if needed
      const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: email,
          name: customer_details.name || 'Customer',
          'metadata[user_id]': user.id.toString(),
          'metadata[session_id]': session.id,
        }),
      })

      if (customerResponse.ok) {
        const customer = await customerResponse.json()
        
        // Update user with Stripe customer ID
        await db.prepare(`
          UPDATE users 
          SET stripe_customer_id = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(customer.id, user.id).run()
        
        // Process subscription update
        await updateUserSubscription(db, customer.id, session)
        await createInvoiceRecord(db, customer.id, session, stripeSecretKey)
        
        console.log(`Linked payment to existing user ${user.id} with new customer ${customer.id}`)
      }
    } else {
      // New user - store payment info for when they sign up
      console.log(`No existing user found for email: ${email} - storing payment for later linking`)
      
      // Store pending payment info
      await db.prepare(`
        INSERT INTO pending_payments (
          email, session_id, amount_total, currency, customer_name,
          created_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        email,
        session.id,
        amount_total,
        currency,
        customer_details.name || 'Customer'
      ).run()
      
      console.log(`Stored pending payment for email: ${email}`)
    }
  } catch (error) {
    console.error('Error handling payment without customer:', error)
  }
}

async function sendPaymentConfirmationEmail(email: string, payment: any, resendApiKey: string) {
  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@email.morsexpress.com',
      to: email,
      subject: 'Payment Confirmation - MorseXpress',
      html: `
        <h2>Payment Confirmation</h2>
        <p>Thank you for your payment!</p>
        <p><strong>Amount:</strong> ${payment.currency} ${payment.amount}</p>
        <p><strong>Session ID:</strong> ${payment.sessionId}</p>
        <p>To access your purchase, please create an account or sign in with this email address.</p>
        <p><a href="https://morsexpress.com/auth?paid=true&session_id=${payment.sessionId}">Complete Your Account Setup</a></p>
      `,
    }),
  })

  if (!emailResponse.ok) {
    throw new Error(`Failed to send email: ${await emailResponse.text()}`)
  }
}

async function updateUserSubscription(db: any, customerId: string, paymentData: any) {
  const { id, status, amount_total, currency, metadata } = paymentData
  
  // Determine plan from metadata or payment amount
  let planId = metadata?.plan_id || 'basic'
  let subscriptionStatus = 'free'
  
  // Map payment amounts to plans
  if (amount_total === 1999) planId = 'basic'
  else if (amount_total === 3999) planId = 'pro'
  else if (amount_total === 7900) planId = 'lifetime'
  
  // Set subscription status based on plan
  if (planId === 'basic') subscriptionStatus = 'basic'
  else if (planId === 'pro') subscriptionStatus = 'active'
  else if (planId === 'lifetime') subscriptionStatus = 'lifetime'

  await db.prepare(`
    UPDATE users 
    SET 
      subscription_status = ?, 
      subscription_expires_at = datetime('now', '+1 year'),
      updated_at = datetime('now')
    WHERE stripe_customer_id = ?
  `).bind(subscriptionStatus, customerId).run()
}

async function createInvoiceRecord(db: any, customerId: string, paymentData: any, stripeSecretKey?: string) {
  // Get user ID from customer ID
  let user = await db.prepare('SELECT id, email, first_name, last_name FROM users WHERE stripe_customer_id = ?').bind(customerId).first()
  
  if (!user && stripeSecretKey) {
    // Fallback: try to find user by email from Stripe customer
    try {
      const customerResponse = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
        },
      })
      
      if (customerResponse.ok) {
        const customer = await customerResponse.json()
        if (customer.email) {
          // Try to find user by email
          user = await db.prepare('SELECT id, email, first_name, last_name FROM users WHERE email = ?').bind(customer.email.toLowerCase()).first()
          
          if (user) {
            // Update user with the correct Stripe customer ID
            await db.prepare(`
              UPDATE users 
              SET stripe_customer_id = ?, updated_at = datetime('now')
              WHERE id = ?
            `).bind(customerId, user.id).run()
            
            console.log(`Linked existing user ${user.id} to Stripe customer ${customerId}`)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Stripe customer for fallback:', error)
    }
  }
  
  if (!user) {
    console.error('User not found for Stripe customer:', customerId)
    return
  }

  // Check if user has billing address
  const billingAddress = await db.prepare(`
    SELECT * FROM user_billing_addresses WHERE user_id = ?
  `).bind(user.id).first()

  if (!billingAddress) {
    console.log(`User ${user.id} has no billing address, payment will be processed when address is added`)
    return
  }

  // Import invoice generator functions
  const { createInvoiceRecord: generateInvoice } = await import('../../../src/lib/invoice-generator.js')

  const {
    id,
    amount_total,
    currency,
    description,
    metadata
  } = paymentData

  // Format user name
  const userName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`.trim()
    : 'Customer'

  // Prepare invoice data
  const invoiceData = {
    userId: user.id,
    userEmail: user.email,
    userName,
    stripeCustomerId: customerId,
    stripeInvoiceId: id || `session_${Date.now()}`,
    amountPaid: amount_total || 0,
    currency: currency || 'usd',
    description: description || 'Premium Plan Purchase',
    billingAddress: {
      line1: billingAddress.line1,
      line2: billingAddress.line2,
      city: billingAddress.city,
      state: billingAddress.state,
      postalCode: billingAddress.postal_code,
      country: billingAddress.country,
      addressType: billingAddress.address_type,
      companyName: billingAddress.company_name,
      taxIdType: billingAddress.tax_id_type,
      taxIdNumber: billingAddress.tax_id_number
    }
  }

  // Generate invoice with sequential number and proper billing snapshot
  await generateInvoice(db, invoiceData)
}

async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const elements = signature.split(',')
    let timestamp = ''
    let v1 = ''

    for (const element of elements) {
      const [key, value] = element.split('=')
      if (key === 't') timestamp = value
      if (key === 'v1') v1 = value
    }

    if (!timestamp || !v1) return false

    // Create the signed payload
    const signedPayload = `${timestamp}.${payload}`
    
    // Create HMAC
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature_buffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload))
    const signature_array = new Uint8Array(signature_buffer)
    const signature_hex = Array.from(signature_array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return signature_hex === v1
  } catch (error) {
    console.error('Error verifying Stripe signature:', error)
    return false
  }
}

// Handle Stripe webhooks
export const onRequest = async (context: { request: Request; env: any }): Promise<Response> => {
  try {
    const { request, env } = context
    
    const stripeWebhookSecret = env.STRIPE_WEBHOOK_SECRET
    if (!stripeWebhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return new Response('Webhook secret not configured', { status: 500 })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return new Response('Missing signature', { status: 400 })
    }

    // Verify webhook signature
    const isValid = await verifyStripeSignature(body, signature, stripeWebhookSecret)
    if (!isValid) {
      console.error('Invalid Stripe signature')
      return new Response('Invalid signature', { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('Stripe webhook event:', event.type)

    const db = env.DB
    if (!db) {
      console.error('Database not available')
      return new Response('Database error', { status: 500 })
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object
          if (session.payment_status === 'paid') {
            if (session.customer) {
              await updateUserSubscription(db, session.customer, session)
              await createInvoiceRecord(db, session.customer, session, env.STRIPE_SECRET_KEY)
              console.log(`Payment completed for customer: ${session.customer}`)
            } else {
              console.log('Payment completed but no customer ID - creating customer from session data')
              await handlePaymentWithoutCustomer(db, session, env.STRIPE_SECRET_KEY, env.RESEND_API_KEY)
            }
          }
          break
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object
          if (paymentIntent.status === 'succeeded') {
            if (paymentIntent.customer) {
              await updateUserSubscription(db, paymentIntent.customer, paymentIntent)
              await createInvoiceRecord(db, paymentIntent.customer, paymentIntent, env.STRIPE_SECRET_KEY)
              console.log(`Payment succeeded for customer: ${paymentIntent.customer}`)
            } else {
              console.log('Payment succeeded but no customer ID - cannot process without customer')
            }
          }
          break
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object
          console.log(`Payment failed for customer: ${paymentIntent.customer}`)
          // Could send email notification here
          break
        }

        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed': {
          const invoice = event.data.object
          await createInvoiceRecord(db, invoice.customer, invoice)
          console.log(`Recorded invoice ${invoice.id} for customer: ${invoice.customer}`)
          break
        }

        case 'checkout.session.expired': {
          const session = event.data.object
          console.log(`Checkout session expired: ${session.id}`)
          // Could add analytics tracking or reminder emails here in the future
          break
        }

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (dbError) {
      console.error('Database error processing webhook:', dbError)
      return new Response('Database error', { status: 500 })
    }

  } catch (error) {
    console.error('Error processing Stripe webhook:', error)
    return new Response('Webhook error', { status: 500 })
  }
} 