"use client"

import React, { useState, useCallback } from 'react'
import DashboardSidebar from './sidebar'
import DashboardHeader from './header'
import './dashboard.css'
import { Project } from '../../hooks/use-project-selection'

interface DashboardLayoutProps {
  children: React.ReactNode
  userData?: {profile: object, projects: Project[]} | null
  selectedProject?: Project | null
  onProjectSelect?: (project: Project) => void
}

export default function DashboardLayout({ 
  children, 
  userData, 
  selectedProject, 
  onProjectSelect 
}: DashboardLayoutProps) {
  // Local state for notifications to handle real-time updates
  const [localNotifications, setLocalNotifications] = useState(selectedProject?.notifications || [])

  // Update local notifications when selectedProject changes
  React.useEffect(() => {
    setLocalNotifications(selectedProject?.notifications || [])
  }, [selectedProject])


  // Handle all notifications read
  const handleAllNotificationsRead = useCallback(() => {
    setLocalNotifications(prev => 
      prev.map(notification => ({ ...notification, is_read: true }))
    )
  }, [])

  // Handle single notification read
  const handleNotificationRead = useCallback(async (notificationId: number) => {
    if (!selectedProject?.id) return

    // Update local state immediately for better UX
    setLocalNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      )
    )

    // Send API request to mark as read on server
    try {
      const response = await fetch(`/api/notifications/${selectedProject.id}/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`)
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      // Revert local state on error
      setLocalNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: false }
            : notification
        )
      )
    }
  }, [selectedProject?.id])

  return (
    <div className="flex flex-col min-h-screen dashboard">
      <main className="flex flex-grow bg-[#f5f7f4] max-w-full">
        <DashboardSidebar 
          userData={userData}
          selectedProject={selectedProject}
          onProjectSelect={onProjectSelect}
        />
        
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col">
          <DashboardHeader 
            selectedProject={selectedProject} 
            notifications={selectedProject ? {
              notifications: localNotifications,
              total_notifications: localNotifications.length
            } : null}
            onAllNotificationsRead={handleAllNotificationsRead}
            onNotificationRead={handleNotificationRead}
          />
          
          {/* Content */}
          <div className="flex-grow min-h-screen">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<{ onNotificationRead?: (notificationId: number) => void }>, { 
                  onNotificationRead: handleNotificationRead 
                });
              }
              return child;
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
