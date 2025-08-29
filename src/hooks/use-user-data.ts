"use client"

import { useState, useEffect, useCallback } from 'react'

interface UserData {
  profile: object
  projects: { id: string; name: string; country: string }[]
}

interface CacheEntry {
  data: UserData
  timestamp: number
  expiresAt: number
}

// In-memory cache with 5-minute TTL
const userDataCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<UserData>>()

export function useUserData(userId: string | null) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = useCallback(async (userId: string): Promise<UserData> => {
    const cacheKey = `user_${userId}`
    const now = Date.now()

    // Check cache first
    const cached = userDataCache.get(cacheKey)
    if (cached && now < cached.expiresAt) {
      return cached.data
    }

    // Check if there's an ongoing request for this user
    const ongoing = ongoingRequests.get(cacheKey)
    if (ongoing) {
      return ongoing
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          cache: 'force-cache',
          next: { revalidate: 300 } // 5 minutes
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error('Invalid response format')
        }

        const userData: UserData = result.data

        // Cache the result
        userDataCache.set(cacheKey, {
          data: userData,
          timestamp: now,
          expiresAt: now + CACHE_TTL
        })

        return userData
      } finally {
        // Remove from ongoing requests
        ongoingRequests.delete(cacheKey)
      }
    })()

    // Track the ongoing request
    ongoingRequests.set(cacheKey, requestPromise)

    return requestPromise
  }, [])

  const loadUserData = useCallback(async () => {
    if (!userId) {
      setUserData(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchUserData(userId)
      setUserData(data)
    } catch (err) {
      console.error('Failed to fetch user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user data')
    } finally {
      setIsLoading(false)
    }
  }, [userId, fetchUserData])

  const invalidateCache = useCallback(() => {
    if (userId) {
      const cacheKey = `user_${userId}`
      userDataCache.delete(cacheKey)
      ongoingRequests.delete(cacheKey)
    }
  }, [userId])

  const refreshUserData = useCallback(async () => {
    invalidateCache()
    await loadUserData()
  }, [invalidateCache, loadUserData])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  return {
    userData,
    isLoading,
    error,
    refreshUserData,
    invalidateCache
  }
}

// Utility function to clear all cached user data
export function clearUserDataCache() {
  userDataCache.clear()
  ongoingRequests.clear()
}
