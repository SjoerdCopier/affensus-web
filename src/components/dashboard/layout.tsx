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

  // Handle single notification read
  const handleNotificationRead = useCallback((notificationId: number) => {
    setLocalNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      )
    )
  }, [])

  // Handle all notifications read
  const handleAllNotificationsRead = useCallback(() => {
    setLocalNotifications(prev => 
      prev.map(notification => ({ ...notification, is_read: true }))
    )
  }, [])

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
            onNotificationRead={handleNotificationRead}
            onAllNotificationsRead={handleAllNotificationsRead}
          />
          
          {/* Content */}
          <div className="flex-grow min-h-screen">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
