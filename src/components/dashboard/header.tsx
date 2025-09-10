"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react'
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
import { useProjectSearch } from '@/hooks/use-project-search'
import { Project } from '@/hooks/use-project-selection'
import { getStatusBadgeStyles } from '@/lib/status-utils'

interface DashboardHeaderProps {
  selectedProject?: Project | null
  notifications?: {
    notifications: Array<{
      id: number
      project_id: string
      message: string
      type: string
      is_read: boolean
      created_at: string
      updated_at: string
      action_url: string | null
    }>
    total_notifications: number
  } | null
  onNotificationRead?: (notificationId: number) => void
  onAllNotificationsRead?: () => void
}

export default function DashboardHeader({ selectedProject, notifications, onNotificationRead, onAllNotificationsRead }: DashboardHeaderProps) {
  const [searchValue, setSearchValue] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<string>('')
  const [hideRejected, setHideRejected] = useState(true)
  const [hideDeleted, setHideDeleted] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const { user, userProfile, isLoading } = useUser()
  const { searchResults, isLoading: isSearchLoading, error, updateSearchQuery } = useProjectSearch(selectedProject?.id || null)
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Get unique networks from search results
  const uniqueNetworks = useMemo(() => {
    if (!searchResults?.merchants) return []
    const networks = [...new Set(searchResults.merchants.map(m => m.network_name))]
    return networks.sort()
  }, [searchResults])

  // Get unread notification count
  const unreadCount = useMemo(() => {
    if (!notifications?.notifications) return 0
    return notifications.notifications.filter(n => !n.is_read).length
  }, [notifications])

  // Mark single notification as read
  const markAsRead = async (notificationId: number) => {
    if (!selectedProject?.id) return

    // Update UI immediately for better UX
    onNotificationRead?.(notificationId)

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
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!selectedProject?.id) return

    // Update UI immediately for better UX
    onAllNotificationsRead?.()

    try {
      const response = await fetch(`/api/notifications/${selectedProject.id}/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.status}`)
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  // Filter merchants based on selected filters
  const filteredMerchants = useMemo(() => {
    if (!searchResults?.merchants) return []
    
    return searchResults.merchants.filter(merchant => {
      // Filter by network
      if (selectedNetwork && merchant.network_name !== selectedNetwork) {
        return false
      }
      
      // Filter out rejected if hideRejected is enabled
      if (hideRejected && merchant.status.toLowerCase() === 'rejected') {
        return false
      }
      
      // Filter out deleted if hideDeleted is enabled
      if (hideDeleted && merchant.status.toLowerCase() === 'deleted') {
        return false
      }
      
      return true
    })
  }, [searchResults, selectedNetwork, hideRejected, hideDeleted])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    updateSearchQuery(value)
    setShowResults(value.length >= 2)
    
    // Reset filters when starting a new search
    if (value.length < 2) {
      setSelectedNetwork('')
      setHideRejected(true)
      setHideDeleted(true)
    }
  }

  // Handle click outside to close results and notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle ESC key to close results and notifications
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowResults(false)
        setShowNotifications(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-300 p-2">
      <div className="relative w-full max-w-lg ml-2" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input
            type="text"
            id="merchant-search"
            name="merchant-search"
            className="dashboard-input-search shadow-sm text-sm"
            placeholder="Search merchants..."
            value={searchValue}
            onChange={handleSearchChange}
            onFocus={() => searchValue.length >= 2 && setShowResults(true)}
          />
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘K</span>
        </div>
        
        {/* Search Results Overlay */}
        {showResults && searchValue.length >= 2 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg overflow-hidden">
            {isSearchLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mx-auto mb-2"></div>
                <div className="text-xs">Searching...</div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                Error: {error}
              </div>
            ) : searchResults && searchResults.merchants.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {/* Filter Controls */}
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-medium text-gray-700">Filter:</span>
                    <select
                      value={selectedNetwork}
                      onChange={(e) => setSelectedNetwork(e.target.value)}
                      className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white"
                    >
                      <option value="">All Networks</option>
                      {uniqueNetworks.map((network) => (
                        <option key={network} value={network}>
                          {network}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={hideRejected}
                        onChange={(e) => setHideRejected(e.target.checked)}
                        className="text-xs"
                      />
                      Hide Rejected
                    </label>
                    <label className="flex items-center gap-1 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={hideDeleted}
                        onChange={(e) => setHideDeleted(e.target.checked)}
                        className="text-xs"
                      />
                      Hide Deleted
                    </label>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Network</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">URL</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredMerchants.length > 0 ? (
                        filteredMerchants.map((merchant) => (
                          <tr
                            key={merchant.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setShowResults(false)
                              // Handle merchant selection if needed
                            }}
                          >
                            <td className="px-3 py-3">
                              <div className="text-xs font-medium text-gray-900 truncate">
                                {merchant.clean_name}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="text-xs text-gray-500 truncate">
                                {merchant.network_name}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="text-xs text-gray-500 truncate">
                                {merchant.display_url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\?.*$/, '').replace(/\/$/, '')}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className={getStatusBadgeStyles(merchant.status)}>
                                {merchant.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-xs text-gray-500">
                            No merchants match the selected filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-2 text-xs text-gray-500 text-center border-t border-gray-100">
                  Showing {filteredMerchants.length} of {searchResults.total_merchants} results
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No results found for &quot;{searchValue}&quot;
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center space-x-1 mr-2">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          Feedback
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <FileText className="h-3 w-3" />
        </Button>
        <div className="relative" ref={notificationsRef}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-3 w-3" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-3 w-3 flex items-center justify-center min-w-[12px]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-8 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-96 overflow-hidden">
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    {notifications && (
                      <p className="text-xs text-gray-500 mt-1">
                        {unreadCount} unread of {notifications.total_notifications} total
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAllAsRead()
                      }}
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications && notifications.notifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {notifications.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${
                          !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={async () => {
                          if (!notification.is_read) {
                            await markAsRead(notification.id)
                          }
                          if (notification.action_url) {
                            window.location.href = notification.action_url
                          }
                          setShowNotifications(false)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleDateString()} at{' '}
                              {new Date(notification.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {notification.type.replace('_', ' ')}
                            </span>
                          </div>
                          {!notification.is_read && (
                            <div className="ml-2 flex-shrink-0">
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
