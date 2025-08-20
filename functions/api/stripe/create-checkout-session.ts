import { verifyJwt } from '../../../src/lib/jwt'
import pricingPlans from '../../../src/pricing-plans.json'
import { locales } from '../../../src/locales/settings'

function parseCookies(cookieHeader: string | null): { [key: string]: string } {
  const cookies: { [key: string]: string } = {}
  if (!cookieHeader) return cookies
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=')
    if (name && value) {
      cookies[name] = decodeURIComponent(value)
    }
  })
  
  return cookies
}

async function getUserByEmail(db: any, email: string) {
  return await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
}

async function createOrUpdateStripeCustomer(db: any, userId: string, stripeCustomerId: string) {
  await db.prepare(`
    UPDATE users 
    SET stripe_customer_id = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(stripeCustomerId, userId).run()
}

// Create Stripe checkout session
export const onRequest = async (context: { request: Request; env: any }): Promise<Response> => {
  try {
    const { request, env } = context
    const cookies = parseCookies(request.headers.get('Cookie'))
    const token = cookies['auth-token']

    const jwtSecret = env.JWT_SECRET
    const stripeSecretKey = env.STRIPE_SECRET_KEY

    if (!jwtSecret || !stripeSecretKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { priceId, currency = 'USD', email, name, promoCode } = await request.json()
    
    // Validate price ID against allowed list
    const allowedPriceIds = env.STRIPE_ALLOWED_PRICE_IDS?.split(',') || [
      'price_basic',
      'price_pro', 
      'price_lifetime'
    ]
    
    // Always allow our internal price IDs
    allowedPriceIds.push('price_pro', 'price_basic', 'price_lifetime')
    
    if (!allowedPriceIds.includes(priceId)) {
      return new Response(JSON.stringify({ error: 'Invalid price ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let customerId: string | null = null
    let userId: string | null = null

    

    // If no customer ID yet (unauthenticated user), let Stripe collect email
    if (!customerId && email) {
      // Only create customer if email is provided, otherwise let Stripe handle it
      // Add location suffix for testing currency conversion
      let customerEmail = email
      if (currency === 'TRY') {
        // Add Turkish location suffix for testing
        customerEmail = customerEmail.replace('@', '+location_TR@')
      }
      
      const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: customerEmail,
          name: name || 'Customer',
          'metadata[temp_user]': 'true',
          'metadata[user_id]': userId || 'temp',
        }),
      })

      if (!customerResponse.ok) {
        console.error('Failed to create Stripe customer:', await customerResponse.text())
        return new Response(JSON.stringify({ error: 'Failed to create customer' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const customer = await customerResponse.json()
      customerId = customer.id
    }

    // Get plan info for dynamic pricing
    const plans = pricingPlans.plans as { [key: string]: any }
    let planId = ''
    let plan = null
    
    // Try to find the plan by stripePriceId
    for (const [id, planData] of Object.entries(plans)) {
      if (planData.stripePriceId === priceId) {
        planId = id
        plan = planData
        break
      }
    }
    
    // If plan not found, try to extract plan ID from priceId (fallback)
    if (!plan) {
      planId = priceId.replace('price_', '')
      plan = plans[planId]
    }

    // Create checkout session
    const checkoutParams: any = {
      'payment_method_types[]': 'card',
      mode: 'payment', // One-time payment instead of subscription
      success_url: `${env.SITE_URL || 'http://localhost:3000'}/auth/?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.SITE_URL || 'http://localhost:3000'}/learn-morse-code/`,
      'metadata[user_id]': userId || 'temp',
      'metadata[plan_id]': priceId,
      'metadata[currency]': currency,
      'metadata[temp_user]': userId ? 'false' : 'true',
    }
    
    // Set customer or let Stripe collect email
    if (customerId) {
      checkoutParams.customer = customerId
    } else {
      // Let Stripe collect the email on the checkout page
      // For currency testing, we can still use customer_email if provided
      if (currency !== 'USD' && email) {
        const countryCode = Object.values(locales).find((locale: any) => locale.currency === currency)?.locale?.split('-')[1]?.toUpperCase()
        if (countryCode) {
          let testEmail = email
          testEmail = testEmail.replace('@', `+location_${countryCode}@`)
          checkoutParams.customer_email = testEmail
        }
      }
    }

    // Determine language based on currency
    let language = 'en'
    if (currency === 'TRY') {
      language = 'tr'
    }
    
    // Get localized description from plan
    const description = plan?.description?.[language] || plan?.description?.en || 'Morse Code Course'
    
    // Use price_data to override description while keeping Adaptive Pricing
    const basePrice = plan?.price
    if (!basePrice) {
      return new Response(JSON.stringify({ error: 'Plan not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Get currency code from settings
    const currencyCode = Object.values(locales).find((locale: any) => locale.currency === currency)?.currency?.toLowerCase() || currency.toLowerCase()
    
    // Use the actual Stripe price ID instead of price_data when we have a promo code
    // This ensures the promotional code can be applied correctly
    if (promoCode) {
      checkoutParams['line_items[0][price]'] = priceId
      checkoutParams['line_items[0][quantity]'] = '1'
    } else {
      // Use price_data for dynamic pricing when no promo code
      checkoutParams['line_items[0][price_data][currency]'] = currencyCode
      checkoutParams['line_items[0][price_data][unit_amount]'] = basePrice.amount.toString()
      checkoutParams['line_items[0][price_data][product_data][name]'] = plan.name?.[language] || plan.name?.en || 'Morse Code Course'
      checkoutParams['line_items[0][price_data][product_data][description]'] = description
      checkoutParams['line_items[0][quantity]'] = '1'
    }

    // Add promotional code if provided
    if (promoCode) {
      checkoutParams['discounts[0][promotion_code]'] = promoCode
    }

    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(checkoutParams),
    })

    if (!checkoutResponse.ok) {
      console.error('Failed to create checkout session:', await checkoutResponse.text())
      return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const session = await checkoutResponse.json()

    return new Response(JSON.stringify({
      url: session.url
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 