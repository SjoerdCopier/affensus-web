"use client"

import { useState, useEffect } from 'react'
import Dashboard from './dashboard'
import DashboardLayout from './layout'
import { useUserData } from '../../hooks/use-user-data'

interface DashboardWrapperProps {
  locale?: string
  children?: React.ReactNode
}

export default function DashboardWrapper({ locale = 'en', children }: DashboardWrapperProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<{id: string, name: string, country: string} | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  
  // Use the new cached hook for user data
  const { userData, isLoading: isUserDataLoading, error: userDataError } = useUserData(userId)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user')
        const data = await response.json()
        
        if (data.authenticated && data.user) {
          const userId = data.user.id.toString()
          setUserId(userId)
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
        setIsAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Set the first project as default selection when userData loads
  useEffect(() => {
    if (userData?.projects && userData.projects.length > 0 && !selectedProject) {
      setSelectedProject(userData.projects[0])
    }
  }, [userData, selectedProject])

  const isLoading = isAuthLoading || isUserDataLoading

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

  if (userDataError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load user data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      userData={userData}
      selectedProject={selectedProject}
      onProjectSelect={setSelectedProject}
    >
      {children || (
        <Dashboard 
          locale={locale} 
          userId={userId}
          userData={userData}
          selectedProject={selectedProject}
        />
      )}
    </DashboardLayout>
  )
} 