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
}

export default function DashboardHeader({ selectedProject }: DashboardHeaderProps) {
  const [searchValue, setSearchValue] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<string>('')
  const [hideRejected, setHideRejected] = useState(false)
  const { user, userProfile, isLoading } = useUser()
  const { searchResults, isLoading: isSearchLoading, error, updateSearchQuery } = useProjectSearch(selectedProject?.id || null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Get unique networks from search results
  const uniqueNetworks = useMemo(() => {
    if (!searchResults?.merchants) return []
    const networks = [...new Set(searchResults.merchants.map(m => m.network_name))]
    return networks.sort()
  }, [searchResults])

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
      
      return true
    })
  }, [searchResults, selectedNetwork, hideRejected])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    updateSearchQuery(value)
    setShowResults(value.length >= 2)
    
    // Reset filters when starting a new search
    if (value.length < 2) {
      setSelectedNetwork('')
      setHideRejected(false)
    }
  }

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle ESC key to close results
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowResults(false)
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
