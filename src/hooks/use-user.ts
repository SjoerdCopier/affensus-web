import { useState, useEffect } from 'react'

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

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get basic user info
        const userResponse = await fetch('/api/user', {
          credentials: 'include'
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.authenticated && userData.user) {
            setUser(userData.user)
            
            // Get profile data
            const profileResponse = await fetch('/api/profile', {
              credentials: 'include'
            })

            if (profileResponse.ok) {
              const profileData = await profileResponse.json()
              setUserProfile(profileData.user)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return { user, userProfile, isLoading }
}
