"use client"

import { useState, useEffect, useCallback } from 'react'

interface ProjectCredentials {
  [key: string]: unknown // API response structure is unknown, will be validated at runtime
}

interface CacheEntry {
  data: ProjectCredentials
  timestamp: number
  expiresAt: number
}

// In-memory cache with 5-minute TTL
const credentialsCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<ProjectCredentials>>()

export function useProjectCredentials(projectId: string | null) {
  const [credentials, setCredentials] = useState<ProjectCredentials | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCredentials = useCallback(async (projectId: string): Promise<ProjectCredentials> => {
    const cacheKey = `project_credentials_${projectId}`
    const now = Date.now()

    // Check cache first
    const cached = credentialsCache.get(cacheKey)
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
        const response = await fetch(`/api/projects/${projectId}/credentials-summary`, {
          cache: 'force-cache',
          next: { revalidate: 300 } // 5 minutes
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch project credentials: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error('Invalid response format')
        }

        const credentials: ProjectCredentials = result.data

        // Cache the result
        credentialsCache.set(cacheKey, {
          data: credentials,
          timestamp: now,
          expiresAt: now + CACHE_TTL
        })

        return credentials
      } finally {
        // Remove from ongoing requests
        ongoingRequests.delete(cacheKey)
      }
    })()

    // Track the ongoing request
    ongoingRequests.set(cacheKey, requestPromise)

    return requestPromise
  }, [])

  const loadCredentials = useCallback(async () => {
    if (!projectId) {
      setCredentials(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchCredentials(projectId)
      setCredentials(data)
    } catch (err) {
      console.error('Failed to fetch project credentials:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch project credentials')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, fetchCredentials])

  const invalidateCache = useCallback(() => {
    if (projectId) {
      const cacheKey = `project_credentials_${projectId}`
      credentialsCache.delete(cacheKey)
      ongoingRequests.delete(cacheKey)
    }
  }, [projectId])

  const refreshCredentials = useCallback(async () => {
    invalidateCache()
    await loadCredentials()
  }, [invalidateCache, loadCredentials])

  useEffect(() => {
    loadCredentials()
  }, [loadCredentials])

  return {
    credentials,
    isLoading,
    error,
    refreshCredentials,
    invalidateCache
  }
}

// Utility function to clear all cached credentials data
export function clearCredentialsCache() {
  credentialsCache.clear()
  ongoingRequests.clear()
}
