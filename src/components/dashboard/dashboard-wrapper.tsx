"use client"

import { useState, useEffect } from 'react'
import Dashboard from './dashboard'

interface DashboardWrapperProps {
  locale?: string
}

export default function DashboardWrapper({ locale = 'en' }: DashboardWrapperProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user')
        const data = await response.json()
        
        if (data.authenticated && data.user) {
          setUserId(data.user.id.toString())
        } else {
          // User is not authenticated, redirect to auth page
          window.location.href = '/auth'
          return
        }
      } catch (error) {
        console.error('Failed to check authentication:', error)
        // On error, also redirect to auth page
        window.location.href = '/auth'
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <Dashboard 
      locale={locale} 
      userId={userId}
    />
  )
} 