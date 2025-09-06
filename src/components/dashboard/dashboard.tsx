"use client"

import { useState } from 'react'
import { Project } from '../../hooks/use-project-selection'

interface WishlistItem {
  wishlist_name: string
  wishlist_url: string
  project_unique_identifier: string
  status: string
  clean_name: string
  display_url: string
  program_id: string
  network_name: string
  network_id: number
  match_type: string
}

interface Statistics {
  credential_count?: number
  linkRot?: {
    totalCount?: number
    validCount?: number
    brokenLinks?: Array<{
      status: string
      [key: string]: unknown
    }>
    unmatchedCount?: number
    inactiveNetworks?: {
      count?: number
      networks?: string[]
    }
  }
  wishList?: {
    newCount?: number
    counts?: {
      Approved?: number
      Pending?: number
      "Not joined"?: number
      Suspended?: number
    }
    wishlistInfo?: WishlistItem[]
  }
}

interface ProjectWithStats extends Project {
  statistics?: Statistics
  updated_at?: string
  country_name?: string
  language_name?: string
}

interface DashboardProps {
  locale?: string
  userId?: string | null
  userData?: {profile: object, projects: ProjectWithStats[]} | null
  selectedProject?: Project | null
}

export default function Dashboard({ userData, selectedProject }: DashboardProps) {
  const [isRefreshingWishlist, setIsRefreshingWishlist] = useState(false);
  const [wishlistStats, setWishlistStats] = useState<Statistics['wishList'] | null>(null);
  const [wishlistData, setWishlistData] = useState<WishlistItem[]>([]);
  const [wishlistSearchTerm, setWishlistSearchTerm] = useState('');
  const [wishlistStatusFilter, setWishlistStatusFilter] = useState('');
  const [wishlistNetworkFilter, setWishlistNetworkFilter] = useState('');
  
  // Find the project with statistics from userData.projects array
  const projectId = selectedProject?.id;
  const project = (userData?.projects || []).find(p => p.id === projectId);
  
  // Extract statistics from the project
  const stats: Statistics = project?.statistics || {};
  const brokenLinks = stats.linkRot?.brokenLinks || [];
  
  // Use local wishlist stats if available, otherwise fall back to project stats
  const currentWishlistStats = wishlistStats || stats.wishList;
  
  // Use local wishlist data if available, otherwise fall back to project stats
  const currentWishlistData = wishlistData.length > 0 ? wishlistData : (stats.wishList?.wishlistInfo || []);
  
  // Calculate statistics
  const brokenLinksTotal = brokenLinks.length;
  const brokenByStatus = brokenLinks.reduce((acc: Record<string, number>, { status }: { status: string }) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Debug logging
  console.log('Project ID:', projectId);
  console.log('Found project:', project);
  console.log('Statistics:', stats);
  console.log('Broken links total:', brokenLinksTotal);
  console.log('Broken by status:', brokenByStatus);

  const handleRefreshWishlist = async () => {
    if (!projectId || isRefreshingWishlist) return;
    
    setIsRefreshingWishlist(true);
    
    try {
      const response = await fetch('/api/refresh-wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectId,
          sendNotification: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh wishlist');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the local wishlist stats with the new data
        setWishlistStats({
          newCount: data.newCount,
          counts: data.counts
        });
        // Store the wishlist data for the table
        setWishlistData(data.wishlistInfo || []);
      } else {
        console.error('Refresh wishlist failed:', data.error);
      }
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    } finally {
      setIsRefreshingWishlist(false);
    }
  };

  return (
    <div className="pt-8 pl-8 pr-8 pb-12">
      <div className="space-y-3">
        <div className="flex justify-end items-center">
          <div className="flex space-x-3 text-xs text-gray-500">
            <span className="font-semibold">{project?.name || 'Select Project'}</span>
            <span>{project?.country_name || ''}</span>
            <span>{project?.language_name || ''}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-gray-200 bg-white text-card-foreground shadow">
            <div className="flex flex-col space-y-1 p-4">
              <h3 className="tracking-tight text-xs font-medium flex items-center justify-between">
                Affiliate Networks
                <button data-state="closed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </button>
              </h3>
            </div>
            <div className="p-4 pt-0">
              <div>
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-600">Networks added:</p>
                    <p className="font-medium text-lg">{stats.credential_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Last updated:</p>
                    <div className="font-medium text-gray-600">
                      <p className="text-xs mt-1 flex items-center">
                        {project?.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-8">
                  <button className="bg-green-500 mr-2 hover:bg-green-600 text-white text-xs font-semibold py-1 px-2 rounded self-start">Add Network</button>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1 px-2 rounded self-start">Import</button>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-300 bg-white text-card-foreground shadow">
            <div className="flex flex-col space-y-1 p-4">
              <h3 className="tracking-tight text-xs font-medium flex items-center justify-between">
                Wishlist
                <button data-state="closed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </button>
              </h3>
            </div>
            <div className="p-4 pt-0">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xs text-gray-600">Wishlist items:</p>
                    <div className="relative inline-block">
                      <p className="font-medium text-center text-lg flex items-center justify-center">
                        <span className="">{currentWishlistStats?.newCount || 0}</span>
                        <button 
                          onClick={handleRefreshWishlist}
                          disabled={isRefreshingWishlist}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-6 w-6"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className={`lucide lucide-refresh-cw h-3 w-3 ${isRefreshingWishlist ? 'animate-spin' : ''}`}
                          >
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                            <path d="M8 16H3v5"></path>
                          </svg>
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Approved:</p>
                    <p className="font-medium text-lg text-green-500">{currentWishlistStats?.counts?.Approved || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Pending:</p>
                    <p className="font-medium text-lg text-orange-500">{currentWishlistStats?.counts?.Pending || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Not Joined:</p>
                    <p className="font-medium text-lg text-blue-500">{currentWishlistStats?.counts?.["Not joined"] || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-300 bg-white text-card-foreground shadow">
            <div className="flex flex-col space-y-1 p-4">
              <h3 className="tracking-tight text-xs font-medium flex items-center justify-between">
                Stopped Campaigns
                <button data-state="closed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </button>
              </h3>
            </div>
            <div className="p-4 pt-0">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xs text-gray-600">Stopped links:</p>
                    <div className="relative inline-block">
                      <p className="font-medium text-left text-red-600 text-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2">
                          <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path>
                        </svg>
                                                {brokenLinksTotal}
                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-6 w-6">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw h-3 w-3">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                            <path d="M8 16H3v5"></path>
                          </svg>
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Total:</p>
                    <p className="font-medium text-base">{stats.linkRot?.totalCount || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Valid:</p>
                    <p className="font-medium text-base">{stats.linkRot?.validCount || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Unknown:</p>
                    <p className="font-medium text-base">{stats.linkRot?.unmatchedCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-300 bg-white text-card-foreground shadow">
            <div className="flex flex-col space-y-1 p-4">
              <h3 className="tracking-tight text-xs font-medium flex items-center justify-between">
                Coupons
                <button data-state="closed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </button>
              </h3>
            </div>
            <div className="p-4 pt-0">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xs text-gray-600">New Coupons:</p>
                    <p className="font-medium text-lg text-green-500">0</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Deals:</p>
                    <p className="font-medium text-lg">23832</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-600">Categories:</p>
                  <ul className="list-disc list-inside text-xs">
                    <li>Coupons: 16045</li>
                    <li>Promotions: 7787</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wishlist Table Card */}
        <div className="mt-6">
          <div className="rounded-lg border border-gray-300 bg-white text-card-foreground shadow">
            <div className="flex flex-col space-y-1 p-4">
              <h3 className="tracking-tight text-sm font-medium flex items-center justify-between">
                Wishlist Details
                <button data-state="closed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </button>
              </h3>
            </div>
            <div className="p-4 pt-0">
              {currentWishlistData.length > 0 ? (
                <>
                  {/* Filters */}
                  <div className="flex gap-2 mb-4 justify-between items-center">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search wishlist..."
                        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent max-w-xs"
                        value={wishlistSearchTerm}
                        onChange={(e) => setWishlistSearchTerm(e.target.value)}
                      />
                      <select
                        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={wishlistStatusFilter}
                        onChange={(e) => setWishlistStatusFilter(e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Not joined">Not joined</option>
                      </select>
                      <select
                        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={wishlistNetworkFilter}
                        onChange={(e) => setWishlistNetworkFilter(e.target.value)}
                      >
                        <option value="">All Networks</option>
                        {(() => {
                          const uniqueNetworks = [...new Set(currentWishlistData.map(item => item.network_name))].sort();
                          return uniqueNetworks.map(network => (
                            <option key={network} value={network}>{network}</option>
                          ));
                        })()}
                      </select>
                      <button
                        onClick={() => {
                          setWishlistSearchTerm('');
                          setWishlistStatusFilter('');
                          setWishlistNetworkFilter('');
                        }}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 px-2 py-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                        Clear Filters
                      </button>
                    </div>
                  </div>
                  
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Network</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Program</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Match Type</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">URL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentWishlistData
                          .filter(item => {
                            // Filter by status (only show Approved, Pending, Not joined)
                            const statusMatch = ['Approved', 'Pending', 'Not joined'].includes(item.status);
                            
                            // Filter by search term
                            const searchMatch = !wishlistSearchTerm || 
                              item.clean_name.toLowerCase().includes(wishlistSearchTerm.toLowerCase()) ||
                              item.network_name.toLowerCase().includes(wishlistSearchTerm.toLowerCase()) ||
                              item.display_url.toLowerCase().includes(wishlistSearchTerm.toLowerCase()) ||
                              item.match_type.toLowerCase().includes(wishlistSearchTerm.toLowerCase());
                            
                            // Filter by status filter
                            const statusFilterMatch = !wishlistStatusFilter || item.status === wishlistStatusFilter;
                            
                            // Filter by network filter
                            const networkFilterMatch = !wishlistNetworkFilter || item.network_name === wishlistNetworkFilter;
                            
                            return statusMatch && searchMatch && statusFilterMatch && networkFilterMatch;
                          })
                          .map((item, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-3">
                                <div className="font-medium text-gray-900">{item.network_name}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="text-gray-900">{item.clean_name}</div>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'Approved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : item.status === 'Pending'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-gray-600">{item.match_type}</td>
                              <td className="py-3 px-3">
                                <a 
                                  href={item.display_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline text-xs truncate block max-w-xs"
                                >
                                  {item.display_url}
                                </a>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No wishlist data available. Click refresh to load data.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}