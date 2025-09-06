"use client"

import React from 'react'
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
              notifications: selectedProject.notifications || [],
              total_notifications: selectedProject.notifications?.length || 0
            } : null}
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
