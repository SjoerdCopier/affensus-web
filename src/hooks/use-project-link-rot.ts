"use client"

import { useState, useEffect, useCallback } from 'react'

interface BrokenLinkItem {
  clean_name: string;
  external_id: string;
  matched_network_ids: number[];
  network_id: number;
  network_name: string;
  program_id: string;
  slug: string;
  status: string;
}

interface ProjectLinkRot {
  broken_links: BrokenLinkItem[];
  total_items?: number;
  [key: string]: unknown; // API response structure may have additional fields
}

interface CacheEntry {
  data: ProjectLinkRot
  timestamp: number
  expiresAt: number
}

// In-memory cache with 5-minute TTL
const linkRotCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<ProjectLinkRot>>()

export function useProjectLinkRot(projectId: string | null) {
  const [linkRotData, setLinkRotData] = useState<ProjectLinkRot | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLinkRot = useCallback(async (projectId: string): Promise<ProjectLinkRot> => {
    const cacheKey = `project_link_rot_${projectId}`
    const now = Date.now()

    // Check cache first
    const cached = linkRotCache.get(cacheKey)
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
        const response = await fetch(`/api/projects/${projectId}/link-rot`, {
          cache: 'force-cache',
          next: { revalidate: 300 } // 5 minutes
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch project link-rot data: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error('Invalid response format')
        }

        const linkRotData: ProjectLinkRot = result.data

        // Cache the result
        linkRotCache.set(cacheKey, {
          data: linkRotData,
          timestamp: now,
          expiresAt: now + CACHE_TTL
        })

        return linkRotData
      } finally {
        // Remove from ongoing requests
        ongoingRequests.delete(cacheKey)
      }
    })()

    // Track the ongoing request
    ongoingRequests.set(cacheKey, requestPromise)

    return requestPromise
  }, [])

  const loadLinkRot = useCallback(async () => {
    if (!projectId) {
      setLinkRotData(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchLinkRot(projectId)
      setLinkRotData(data)
    } catch (err) {
      console.error('Failed to fetch project link-rot data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch project link-rot data')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, fetchLinkRot])

  const invalidateCache = useCallback(() => {
    if (projectId) {
      const cacheKey = `project_link_rot_${projectId}`
      linkRotCache.delete(cacheKey)
      ongoingRequests.delete(cacheKey)
    }
  }, [projectId])

  const refreshLinkRot = useCallback(async () => {
    invalidateCache()
    await loadLinkRot()
  }, [invalidateCache, loadLinkRot])

  useEffect(() => {
    loadLinkRot()
  }, [loadLinkRot])

  return {
    linkRotData,
    isLoading,
    error,
    refreshLinkRot,
    invalidateCache
  }
}

// Utility function to clear all cached link-rot data
export function clearLinkRotCache() {
  linkRotCache.clear()
  ongoingRequests.clear()
}

