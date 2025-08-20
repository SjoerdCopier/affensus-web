import { useState, useEffect } from 'react'

interface CurrencyRates {
  rates: { [key: string]: number }
  lastUpdated: string
  baseCurrency: string
}

interface UseCurrencyRatesReturn {
  rates: { [key: string]: number } | null
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

export function useCurrencyRates(): UseCurrencyRatesReturn {
  const [rates, setRates] = useState<{ [key: string]: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/currency-rates')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch rates: ${response.status}`)
        }

        const data: CurrencyRates = await response.json()
        
        setRates(data.rates)
        setLastUpdated(data.lastUpdated)
      } catch (err) {
        console.error('Error fetching currency rates:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch currency rates')
        
        // Set fallback rates
        setRates({
          'USD': 1,
          'TRY': 32.5
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [])

  return {
    rates,
    loading,
    error,
    lastUpdated
  }
} 