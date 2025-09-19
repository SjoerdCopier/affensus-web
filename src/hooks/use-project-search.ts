import { useState, useEffect, useCallback, useRef } from 'react'

interface SearchMerchant {
  id: number
  name: string
  clean_name: string
  domains: string
  display_url: string
  logo: string
  status: string
  published_tag: string
  published_slug: string
  published_coupons: unknown
  countries: string[]
  commission: {
    payouts: {
      CPS: Array<{ currency: string; item: string; value: string; }>;
      CPA?: Array<{ currency: string; item: string; value: string; }>;
      CPL?: Array<{ currency: string; item: string; value: string; }>;
    };
  }
  description: string
  timestamp: string
  created_at: string
  updated_at: string
  network_name: string
  deeplink: string
  credential_id: string
  identifier_id: string
}

interface SearchResponse {
  project_id: string
  search_query: string
  merchants: SearchMerchant[]
  total_merchants: number
}

// In-memory cache
const cache = new Map<string, { data: SearchResponse; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<SearchResponse>>()

export function useProjectSearch(projectId: string | null) {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const currentSearchIdRef = useRef<string>('')

  const searchMerchants = useCallback(async (query: string): Promise<SearchResponse | null> => {
    if (!projectId || !query || query.length < 2) {
      return null
    }

    const cacheKey = `search_${projectId}_${query}`

    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    // Check if there's an ongoing request for this same search
    if (ongoingRequests.has(cacheKey)) {
      return await ongoingRequests.get(cacheKey)!
    }

    // Create the request promise
    const requestPromise = (async (): Promise<SearchResponse> => {
      const response = await fetch(`/api/projects/${projectId}/search?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`Failed to search: ${response.statusText}`)
      }

      const data: SearchResponse = await response.json()
      
      // Cache the result
      cache.set(cacheKey, { data, timestamp: Date.now() })
      
      return data
    })()

    // Store the ongoing request
    ongoingRequests.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } catch (err) {
      throw err
    } finally {
      // Clean up the ongoing request
      ongoingRequests.delete(cacheKey)
    }
  }, [projectId])

  // Debounced search effect
  useEffect(() => {
    // Generate unique search ID for this search
    const searchId = `${Date.now()}_${Math.random()}`
    currentSearchIdRef.current = searchId
    
    // Reset results immediately on every keystroke
    setSearchResults(null)
    setError(null)
    
    if (!searchQuery || searchQuery.length < 2) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Debounce the search by 300ms
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchMerchants(searchQuery)
        
        // Only set results if this is still the most recent search
        if (searchId === currentSearchIdRef.current) {
          setSearchResults(results)
          setIsLoading(false)
        }
      } catch (err) {
        // Only set error if this is still the most recent search
        if (searchId === currentSearchIdRef.current) {
          setError(err instanceof Error ? err.message : 'Search failed')
          setSearchResults(null)
          setIsLoading(false)
        }
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [searchQuery, searchMerchants])

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults(null)
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    searchResults,
    isLoading,
    error,
    searchQuery,
    updateSearchQuery,
    clearSearch,
  }
}
