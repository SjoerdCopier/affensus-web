"use client"

import React from 'react'
import DashboardSidebar from './sidebar'
import DashboardHeader from './header'
import './dashboard.css'


interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen dashboard">
      <main className="flex flex-grow bg-[#f5f7f4] max-w-full">
        <DashboardSidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col">
          <DashboardHeader />
          
          {/* Content */}
          <div className="flex-grow min-h-screen">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
