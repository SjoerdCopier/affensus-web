"use client"

import { useState, useEffect, useCallback } from 'react'

interface Merchant {
  id: number
  credential_id: string
  program_id: string
  identifier_id: string
  network_id: number
  project_id: string
  status: string
  name: string
  clean_name: string
  display_url: string
  domains: string
  logo: string
  deeplink: string
  countries: string[]
  commission: { rate: string }
  description: string
  timestamp: string
  created_at: string
  updated_at: string
  published_tag: string
}

interface ProjectMerchants {
  project_id: string
  network_id: number
  credential_id: string
  merchants: Merchant[]
  total_merchants: number
}

interface CacheEntry {
  data: ProjectMerchants
  timestamp: number
  expiresAt: number
}

// In-memory cache with 5-minute TTL
const merchantsCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<ProjectMerchants>>()

export function useProjectMerchants(
  projectId: string | null, 
  networkId: string | null, 
  credentialId: string | null
) {
  const [merchants, setMerchants] = useState<ProjectMerchants | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMerchants = useCallback(async (
    projectId: string, 
    networkId: string, 
    credentialId: string
  ): Promise<ProjectMerchants> => {
    const cacheKey = `merchants_${projectId}_${networkId}_${credentialId}`
    const now = Date.now()

    // Check cache first
    const cached = merchantsCache.get(cacheKey)
    if (cached && now < cached.expiresAt) {
      return cached.data
    }

    // Check if there's an ongoing request
    const ongoing = ongoingRequests.get(cacheKey)
    if (ongoing) {
      return ongoing
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const response = await fetch(
          `/api/projects/${projectId}/merchants?network_id=${networkId}&credential_id=${credentialId}`,
          {
            cache: 'force-cache',
            next: { revalidate: 300 } // 5 minutes
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch project merchants: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error('Invalid response format')
        }

        const merchants: ProjectMerchants = result.data

        // Console log the response for debugging
        console.log('Project Merchants Response:', merchants)

        // Cache the result
        merchantsCache.set(cacheKey, {
          data: merchants,
          timestamp: now,
          expiresAt: now + CACHE_TTL
        })

        return merchants
      } finally {
        // Remove from ongoing requests
        ongoingRequests.delete(cacheKey)
      }
    })()

    // Track the ongoing request
    ongoingRequests.set(cacheKey, requestPromise)

    return requestPromise
  }, [])

  const loadMerchants = useCallback(async () => {
    if (!projectId || !networkId || !credentialId) {
      setMerchants(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchMerchants(projectId, networkId, credentialId)
      setMerchants(data)
    } catch (err) {
      console.error('Failed to fetch project merchants:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch project merchants')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, networkId, credentialId, fetchMerchants])

  const invalidateCache = useCallback(() => {
    if (projectId && networkId && credentialId) {
      const cacheKey = `merchants_${projectId}_${networkId}_${credentialId}`
      merchantsCache.delete(cacheKey)
      ongoingRequests.delete(cacheKey)
    }
  }, [projectId, networkId, credentialId])

  const refreshMerchants = useCallback(async () => {
    invalidateCache()
    await loadMerchants()
  }, [invalidateCache, loadMerchants])

  useEffect(() => {
    loadMerchants()
  }, [loadMerchants])

  return {
    merchants,
    isLoading,
    error,
    refreshMerchants,
    invalidateCache
  }
}

// Utility function to clear all cached merchants data
export function clearMerchantsCache() {
  merchantsCache.clear()
  ongoingRequests.clear()
}

export type { Merchant, ProjectMerchants }

