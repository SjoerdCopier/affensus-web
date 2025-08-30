"use client"

import React, { useState, useEffect } from 'react'
import Dashboard from './dashboard'
import DashboardLayout from './layout'
import { useUserData } from '../../hooks/use-user-data'
import { useProjectSelection, Project } from '../../hooks/use-project-selection'

interface DashboardWrapperProps {
  locale?: string
  children?: React.ReactNode
}

export default function DashboardWrapper({ locale = 'en', children }: DashboardWrapperProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  
  // Use the new cached hook for user data
  const { userData, isLoading: isUserDataLoading, error: userDataError } = useUserData(userId)
  
  // Use project selection hook
  const { selectedProject, setSelectedProject, initializeProjectSelection } = useProjectSelection()

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

  // Initialize project selection when userData loads
  useEffect(() => {
    if (userData?.projects && userData.projects.length > 0) {
      // Only initialize if we don't already have a selected project
      if (!selectedProject) {
        initializeProjectSelection(userData.projects)
      }
    }
  }, [userData, selectedProject, initializeProjectSelection])

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

  // Handle case where user has no projects
  if (!isLoading && userData && (!userData.projects || userData.projects.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h2>
          <p className="text-gray-600 mb-6">
            It looks like you don&apos;t have any projects set up yet. Contact support to get started with your first project.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/dashboard/profile'} 
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to Profile
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
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
      {children && React.isValidElement(children) 
        ? React.cloneElement(children as React.ReactElement<{ selectedProject?: Project | null }>, { selectedProject })
        : children || (
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