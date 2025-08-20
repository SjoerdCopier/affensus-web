import { locales } from '../../src/locales/settings'

interface ExchangeRateResponse {
  result: string
  conversion_rates: { [key: string]: number }
}

interface CurrencyRatesResponse {
  rates: { [key: string]: number }
  lastUpdated: string
  baseCurrency: string
}

export const onRequest = async (context: any) => {
  const { request } = context

  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Extract unique currencies from settings.ts
    const supportedCurrencies = Array.from(
      new Set(Object.values(locales).map((locale: any) => locale.currency))
    )

    // Check cache headers
    const cacheControl = 'public, max-age=21600' // 6 hours
    
    const API_KEY = context.env.EXCHANGE_RATE_API_KEY
    const BASE_CURRENCY = 'USD'
    
    if (!API_KEY) {
      throw new Error('EXCHANGE_RATE_API_KEY environment variable is not set')
    }
    
    // Fetch exchange rates from ExchangeRate-API
    const apiUrl = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`Exchange rate API failed: ${response.status}`)
    }

    const data: ExchangeRateResponse = await response.json()
    
    if (data.result !== 'success') {
      throw new Error('Invalid API response')
    }

    // Filter rates to only include supported currencies
    const filteredRates: { [key: string]: number } = {}
    supportedCurrencies.forEach(currency => {
      if (data.conversion_rates[currency]) {
        filteredRates[currency] = data.conversion_rates[currency]
      }
    })

    const result: CurrencyRatesResponse = {
      rates: filteredRates,
      lastUpdated: new Date().toISOString(),
      baseCurrency: BASE_CURRENCY
    }

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl,
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('Currency rates API error:', error)
    
    // Return fallback rates if API fails
    const fallbackRates: CurrencyRatesResponse = {
      rates: {
        'USD': 1,
        'TRY': 32.5 // Approximate fallback rate
      },
      lastUpdated: new Date().toISOString(),
      baseCurrency: 'USD'
    }

    return new Response(JSON.stringify(fallbackRates), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 minutes cache for fallback
        ...corsHeaders
      },
      status: 200 // Return 200 to not break frontend
    })
  }
} 