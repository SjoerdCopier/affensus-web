"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { 
  Search,
  Bell,
  FileText,
  CircleUser
} from "lucide-react"
import { useUser } from '@/hooks/use-user'

export default function DashboardHeader() {
  const [searchValue, setSearchValue] = useState('')
  const { user, userProfile, isLoading } = useUser()

  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-300 p-2">
      <div className="relative w-full max-w-lg ml-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input
            type="text"
            id="merchant-search"
            name="merchant-search"
            className="dashboard-input-search shadow-sm text-sm"
            placeholder="Search merchants..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘K</span>
        </div>
      </div>
      <div className="flex items-center space-x-1 mr-2">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          Feedback
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <FileText className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Bell className="h-3 w-3" />
        </Button>
        <Link href="/dashboard/profile">
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-7 px-2">
            <div className="relative flex h-5 w-5 shrink-0 overflow-hidden rounded-full">
              {userProfile?.avatarUrl ? (
                <Image 
                  src={userProfile.avatarUrl} 
                  alt="Profile" 
                  width={20}
                  height={20}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                  <CircleUser className="h-3 w-3" />
                </div>
              )}
            </div>
            <span className="text-xs font-medium">
              {!isLoading && user ? user.email : 'Loading...'}
            </span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
