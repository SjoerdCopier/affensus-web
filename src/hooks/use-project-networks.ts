"use client"

import { useState, useEffect, useCallback } from 'react'

interface ProjectNetworks {
  [key: string]: unknown // API response structure is unknown, will be validated at runtime
}

interface CacheEntry {
  data: ProjectNetworks
  timestamp: number
  expiresAt: number
}

// In-memory cache with 5-minute TTL
const networksCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<ProjectNetworks>>()

export function useProjectNetworks(projectId: string | null) {
  const [networks, setNetworks] = useState<ProjectNetworks | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNetworks = useCallback(async (projectId: string): Promise<ProjectNetworks> => {
    const cacheKey = `project_networks_${projectId}`
    const now = Date.now()

    // Check cache first
    const cached = networksCache.get(cacheKey)
    if (cached && now < cached.expiresAt) {
      return cached.data
    }

    // Check if there's an ongoing request for this project
    const ongoing = ongoingRequests.get(cacheKey)
    if (ongoing) {
      return ongoing
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/networks`, {
          cache: 'force-cache',
          next: { revalidate: 300 } // 5 minutes
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch project networks: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error('Invalid response format')
        }

        const networks: ProjectNetworks = result.data

        // Console log the response for debugging
        console.log('Project Networks Response:', networks)

        // Cache the result
        networksCache.set(cacheKey, {
          data: networks,
          timestamp: now,
          expiresAt: now + CACHE_TTL
        })

        return networks
      } finally {
        // Remove from ongoing requests
        ongoingRequests.delete(cacheKey)
      }
    })()

    // Track the ongoing request
    ongoingRequests.set(cacheKey, requestPromise)

    return requestPromise
  }, [])

  const loadNetworks = useCallback(async () => {
    if (!projectId) {
      setNetworks(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchNetworks(projectId)
      setNetworks(data)
    } catch (err) {
      console.error('Failed to fetch project networks:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch project networks')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, fetchNetworks])

  const invalidateCache = useCallback(() => {
    if (projectId) {
      const cacheKey = `project_networks_${projectId}`
      networksCache.delete(cacheKey)
      ongoingRequests.delete(cacheKey)
    }
  }, [projectId])

  const refreshNetworks = useCallback(async () => {
    invalidateCache()
    await loadNetworks()
  }, [invalidateCache, loadNetworks])

  useEffect(() => {
    loadNetworks()
  }, [loadNetworks])

  return {
    networks,
    isLoading,
    error,
    refreshNetworks,
    invalidateCache
  }
}

// Utility function to clear all cached networks data
export function clearNetworksCache() {
  networksCache.clear()
  ongoingRequests.clear()
}
