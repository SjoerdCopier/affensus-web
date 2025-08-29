import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  email: string
  loginMethod?: string
}

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
}

interface CacheEntry {
  user: User | null
  userProfile: UserProfile | null
  timestamp: number
  expiresAt: number
}

// In-memory cache with 5-minute TTL
const userCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Track ongoing requests to prevent duplicates
const ongoingUserRequests = new Map<string, Promise<{ user: User | null; userProfile: UserProfile | null }>>()

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserData = useCallback(async (): Promise<{ user: User | null; userProfile: UserProfile | null }> => {
    const cacheKey = 'current_user'
    const now = Date.now()

    // Check cache first
    const cached = userCache.get(cacheKey)
    if (cached && now < cached.expiresAt) {
      return { user: cached.user, userProfile: cached.userProfile }
    }

    // Check if there's an ongoing request
    const ongoing = ongoingUserRequests.get(cacheKey)
    if (ongoing) {
      return ongoing
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        let user: User | null = null
        let userProfile: UserProfile | null = null

        // Get basic user info
        const userResponse = await fetch('/api/user', {
          credentials: 'include',
          cache: 'force-cache',
          next: { revalidate: 300 } // 5 minutes
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.authenticated && userData.user) {
            user = userData.user
            
            // Get profile data
            const profileResponse = await fetch('/api/profile', {
              credentials: 'include',
              cache: 'force-cache',
              next: { revalidate: 300 } // 5 minutes
            })

            if (profileResponse.ok) {
              const profileData = await profileResponse.json()
              userProfile = profileData.user
            }
          }
        }

        // Cache the result
        userCache.set(cacheKey, {
          user,
          userProfile,
          timestamp: now,
          expiresAt: now + CACHE_TTL
        })

        return { user, userProfile }
      } finally {
        // Remove from ongoing requests
        ongoingUserRequests.delete(cacheKey)
      }
    })()

    // Track the ongoing request
    ongoingUserRequests.set(cacheKey, requestPromise)

    return requestPromise
  }, [])

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user, userProfile } = await fetchUserData()
        setUser(user)
        setUserProfile(userProfile)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [fetchUserData])

  return { user, userProfile, isLoading }
}

// Utility function to clear user cache
export function clearUserCache() {
  userCache.clear()
  ongoingUserRequests.clear()
}
