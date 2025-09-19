"use client"

import { useState, useEffect } from 'react'
import { Project } from '../../hooks/use-project-selection'
import { SlidePanel } from '../ui/slide-panel'
import { MerchantDetailsPanel } from './merchant-details-panel'
import { trimUrl, ensureHttps } from '../../lib/url-utils'

interface WishlistItem {
  clean_name: string
  commission: {
    payouts: {
      CPS: Array<{
        currency: string | null
        item: string
        value: string
      }>
    }
  }
  deeplink: string
  description: string | null
  display_url: string
  logo: string
  match_type: string
  merchant_id: number
  network_id: number
  network_name: string
  program_id: string
  project_unique_identifier: string
  credential_id: string // New field from wishlist-info API
  status: string
  wishlist_name: string
  wishlist_url: string
  // Additional fields for compatibility with MerchantDetailsPanel
  id: number
  created_at?: string
  updated_at?: string
  published_tag?: string
  domains?: string
  countries?: string[]
  identifier_id?: string
}

interface MerchantData {
  id: number
  clean_name: string
  status: string
  display_url: string
  published_tag?: string
  created_at?: string
  updated_at?: string
  deeplink: string
  logo: string
  countries?: string[]
  domains?: string
  program_id: string
  identifier_id?: string
  commission: {
    payouts: {
      CPS: Array<{
        currency: string
        item: string
        value: string
      }>
      CPA: Array<{
        currency: string
        item: string
        value: string
      }>
      CPL: Array<{
        currency: string
        item: string
        value: string
      }>
    }
  }
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
  const [isLoadingWishlistInfo, setIsLoadingWishlistInfo] = useState(false);
  const [wishlistStats, setWishlistStats] = useState<Statistics['wishList'] | null>(null);
  const [wishlistData, setWishlistData] = useState<WishlistItem[]>([]);
  const [wishlistSearchTerm, setWishlistSearchTerm] = useState('');
  const [wishlistStatusFilter, setWishlistStatusFilter] = useState('');
  const [wishlistNetworkFilter, setWishlistNetworkFilter] = useState('');
  const [wishlistRowsPerPage, setWishlistRowsPerPage] = useState<number>(50);
  const [wishlistCurrentPage, setWishlistCurrentPage] = useState<number>(1);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState<MerchantData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [openWishlistMenuId, setOpenWishlistMenuId] = useState<string | null>(null);
  const [hiddenWishlistItems, setHiddenWishlistItems] = useState<Set<string>>(new Set());
  
  // Link rot refresh state
  const [isRefreshingLinkRot, setIsRefreshingLinkRot] = useState(false);
  const [linkRotStats, setLinkRotStats] = useState<Statistics['linkRot'] | null>(null);
  const [stoppedLinksCount, setStoppedLinksCount] = useState<number | null>(null);
  
  // Find the project with statistics from userData.projects array
  const projectId = selectedProject?.id;
  const project = (userData?.projects || []).find(p => p.id === projectId);
  
  // Extract statistics from the project
  const stats: Statistics = project?.statistics || {};
  const brokenLinks = stats.linkRot?.brokenLinks || [];
  
  // Use local wishlist stats if available, otherwise fall back to project stats
  const currentWishlistStats = wishlistStats || stats.wishList;
  
  // Use local link rot stats if available, otherwise fall back to project stats
  const currentLinkRotStats = linkRotStats || stats.linkRot;
  
  // Use local wishlist data if available, otherwise empty array (will be populated by new endpoint)
  const currentWishlistData = wishlistData.length > 0 ? wishlistData : [];

  // Handle clicking outside menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openWishlistMenuId && !(event.target as Element).closest('.wishlist-menu-container')) {
        setOpenWishlistMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openWishlistMenuId]);

  // Hide wishlist item function
  const handleHideWishlistItem = async (item: WishlistItem) => {
    // Create unique identifier for the item
    const itemId = `${item.merchant_id}-${item.network_id}-${item.program_id}`;
    
    // Immediately hide the item in UI
    setHiddenWishlistItems(prev => new Set(prev).add(itemId));
    setOpenWishlistMenuId(null);
    
    try {
      // Call the hide API endpoint
      const response = await fetch('/api/merchants/hide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          merchants: [{
            credential_id: item.credential_id, // Use the credential_id from wishlist-info API
            program_id: item.program_id,
            network_id: item.network_id,
            project_id: selectedProject?.id
          }]
        }),
      });

      if (!response.ok) {
        // If API call fails, remove from hidden items to show it again
        setHiddenWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        console.error('Failed to hide merchant:', response.statusText);
      }
    } catch (error) {
      // If API call fails, remove from hidden items to show it again
      setHiddenWishlistItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      console.error('Error hiding merchant:', error);
    }
  };
  
  // Calculate statistics
  const brokenLinksTotal = stoppedLinksCount !== null ? stoppedLinksCount : (currentLinkRotStats?.brokenLinks?.length || brokenLinks.length);
  const brokenByStatus = (currentLinkRotStats?.brokenLinks || brokenLinks).reduce((acc: Record<string, number>, { status }: { status: string }) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Debug logging
  console.log('Project ID:', projectId);
  console.log('Found project:', project);
  console.log('Statistics:', stats);
  console.log('Broken links total:', brokenLinksTotal);
  console.log('Broken by status:', brokenByStatus);


  // Reset to page 1 when filters change
  useEffect(() => {
    setWishlistCurrentPage(1);
  }, [wishlistSearchTerm, wishlistStatusFilter, wishlistNetworkFilter, wishlistRowsPerPage]);

  // Auto-fetch wishlist info when dashboard loads
  useEffect(() => {
    if (projectId) {
      const fetchWishlistInfo = async () => {
        setIsLoadingWishlistInfo(true);
        
        try {
          const response = await fetch('/api/wishlist-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              project_id: projectId
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch wishlist info');
          }

          const data = await response.json();
          
          if (data.success && data.data) {
            setWishlistData(data.data.wishlistInfo || []);
          } else {
            console.error('Fetch wishlist info failed:', data.error);
          }
        } catch (error) {
          console.error('Error fetching wishlist info:', error);
        } finally {
          setIsLoadingWishlistInfo(false);
        }
      };

      fetchWishlistInfo();
    }
  }, [projectId]);

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

  const handleRefreshLinkRot = async () => {
    if (!projectId || isRefreshingLinkRot) return;
    
    setIsRefreshingLinkRot(true);
    
    try {
      const response = await fetch('/api/refresh-published', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh published links');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the local link rot stats with the new data
        setLinkRotStats(data.linkRot);
        // Update the stopped links count
        setStoppedLinksCount(data.stoppedLinks);
      } else {
        console.error('Refresh published links failed:', data.error);
      }
    } catch (error) {
      console.error('Error refreshing published links:', error);
    } finally {
      setIsRefreshingLinkRot(false);
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
                        <button 
                          onClick={handleRefreshLinkRot}
                          disabled={isRefreshingLinkRot}
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
                            className={`lucide lucide-refresh-cw h-3 w-3 ${isRefreshingLinkRot ? 'animate-spin' : ''}`}
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
                    <p className="text-xs text-gray-600">Total:</p>
                    <p className="font-medium text-base">{currentLinkRotStats?.totalCount || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Valid:</p>
                    <p className="font-medium text-base">{currentLinkRotStats?.validCount || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Unknown:</p>
                    <p className="font-medium text-base">{currentLinkRotStats?.unmatchedCount || 0}</p>
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
              {isLoadingWishlistInfo ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm">Loading wishlist data...</p>
                  </div>
                </div>
              ) : currentWishlistData.length > 0 ? (
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
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Filter data based on search and filters
                          const filteredData = currentWishlistData.filter(item => {
                            // Filter out hidden items
                            const itemId = `${item.merchant_id}-${item.network_id}-${item.program_id}`;
                            const isHidden = hiddenWishlistItems.has(itemId);
                            if (isHidden) return false;
                            
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
                          });

                          // Apply pagination
                          const startIndex = (wishlistCurrentPage - 1) * wishlistRowsPerPage;
                          const endIndex = startIndex + wishlistRowsPerPage;
                          const displayedData = filteredData.slice(startIndex, endIndex);
                          const totalPages = Math.ceil(filteredData.length / wishlistRowsPerPage);

                          return displayedData.map((item, index) => (
                            <tr 
                              key={index} 
                              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                // Convert wishlist item to merchant format for the panel
                                const merchantData: MerchantData = {
                                  id: item.merchant_id,
                                  clean_name: item.clean_name,
                                  status: item.status.toLowerCase(),
                                  display_url: item.display_url,
                                  published_tag: item.published_tag,
                                  created_at: item.created_at,
                                  updated_at: item.updated_at,
                                  deeplink: item.deeplink,
                                  logo: item.logo,
                                  countries: item.countries,
                                  domains: item.domains,
                                  program_id: item.program_id,
                                  identifier_id: item.identifier_id,
                                  commission: {
                                    payouts: {
                                      CPS: (item.commission?.payouts?.CPS || []).map(payout => ({
                                        currency: payout.currency || '',
                                        item: payout.item,
                                        value: payout.value
                                      })),
                                      CPA: [],
                                      CPL: []
                                    }
                                  }
                                };
                                setSelectedWishlistItem(merchantData);
                                setIsPanelOpen(true);
                              }}
                            >
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
                                  href={ensureHttps(item.display_url)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline text-xs truncate block max-w-xs"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {trimUrl(item.display_url, 40)}
                                </a>
                              </td>
                              <td className="py-3 px-3">
                                <div className="wishlist-menu-container relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const itemId = `${item.merchant_id}-${item.network_id}-${item.program_id}`;
                                      setOpenWishlistMenuId(openWishlistMenuId === itemId ? null : itemId);
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis h-4 w-4 text-gray-500">
                                      <circle cx="12" cy="12" r="1"></circle>
                                      <circle cx="19" cy="12" r="1"></circle>
                                      <circle cx="5" cy="12" r="1"></circle>
                                    </svg>
                                  </button>
                                  {openWishlistMenuId === `${item.merchant_id}-${item.network_id}-${item.program_id}` && (
                                    <div className="absolute right-0 top-full mt-1 w-24 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleHideWishlistItem(item);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md"
                                      >
                                        Hide
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  {(() => {
                    // Recalculate filtered data for pagination controls
                    const filteredData = currentWishlistData.filter(item => {
                      // Filter out hidden items
                      const itemId = `${item.merchant_id}-${item.network_id}-${item.program_id}`;
                      const isHidden = hiddenWishlistItems.has(itemId);
                      if (isHidden) return false;
                      
                      const statusMatch = ['Approved', 'Pending', 'Not joined'].includes(item.status);
                      const searchMatch = !wishlistSearchTerm || 
                        item.clean_name.toLowerCase().includes(wishlistSearchTerm.toLowerCase()) ||
                        item.network_name.toLowerCase().includes(wishlistSearchTerm.toLowerCase()) ||
                        item.display_url.toLowerCase().includes(wishlistSearchTerm.toLowerCase()) ||
                        item.match_type.toLowerCase().includes(wishlistSearchTerm.toLowerCase());
                      const statusFilterMatch = !wishlistStatusFilter || item.status === wishlistStatusFilter;
                      const networkFilterMatch = !wishlistNetworkFilter || item.network_name === wishlistNetworkFilter;
                      return statusMatch && searchMatch && statusFilterMatch && networkFilterMatch;
                    });
                    
                    const totalPages = Math.ceil(filteredData.length / wishlistRowsPerPage);
                    
                    if (totalPages <= 1) return null;
                    
                    return (
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Showing {((wishlistCurrentPage - 1) * wishlistRowsPerPage) + 1} to {Math.min(wishlistCurrentPage * wishlistRowsPerPage, filteredData.length)} of {filteredData.length} results
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setWishlistCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={wishlistCurrentPage === 1}
                            className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 px-2 py-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                            Previous
                          </button>
                          <span className="text-xs text-gray-500 px-2">
                            Page {wishlistCurrentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setWishlistCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={wishlistCurrentPage === totalPages}
                            className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 px-2 py-1"
                          >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Rows per page:</span>
                          <select
                            value={wishlistRowsPerPage}
                            onChange={(e) => setWishlistRowsPerPage(Number(e.target.value))}
                            className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>
                      </div>
                    );
                  })()}
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

      {/* Wishlist Item Details Slide Panel */}
      <SlidePanel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedWishlistItem(null);
        }}
        initialWidth={40}
        minWidth={20}
        maxWidth={60}
      >
        <MerchantDetailsPanel 
          merchant={selectedWishlistItem}
          onClose={() => {
            setIsPanelOpen(false);
            setSelectedWishlistItem(null);
          }}
        />
      </SlidePanel>
    </div>
  )
}