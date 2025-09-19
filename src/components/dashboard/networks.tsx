"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Project } from '../../hooks/use-project-selection';
import { useProjectCredentials } from '../../hooks/use-project-credentials';
import { useProjectNetworks } from '../../hooks/use-project-networks';
import { useProjectMerchants, clearMerchantsCache } from '../../hooks/use-project-merchants';
import { useJobMonitor } from '../../hooks/use-global-job-monitor';
import { getStatusBadgeStylesWithFontSize } from '../../lib/status-utils';
import { SlidePanel } from '../ui/slide-panel';
import { MerchantDetailsPanel } from './merchant-details-panel';

interface NetworksProps {
  locale?: string;
  selectedProject?: Project | null;
}

interface Network {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  lastChecked: string;
  credential_id: string;
  network_id: number;
  updated: number;
  credential_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface GroupedNetwork {
  name: string;
  instances: Array<{
    id: string;
    status: 'active' | 'inactive' | 'pending';
    credential_name?: string;
  }>;
}

interface ErrorDetail {
  credential_id: string;
  network_id: string;
  network_name: string;
  error_message: string;
}

interface CredentialsSummary {
  total_credentials: number;
  loaded_credentials: number;
  error_credentials: number;
  outdated_credentials: number;
  financial_credentials: number;
  updated_credentials: number;
}

interface ProjectCredentialsResponse {
  summary: CredentialsSummary;
  error_details?: ErrorDetail[];
}

interface Merchant {
  id: number;
  clean_name: string;
  status: string;
  display_url: string;
  published_tag?: string;
  created_at?: string;
  updated_at?: string;
}



export default function DashboardNetworks({ selectedProject }: NetworksProps) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [merchantSearchTerm, setMerchantSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [publishedTagFilter, setPublishedTagFilter] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [updatedTimestamps, setUpdatedTimestamps] = useState<{ [credentialId: string]: number }>({});
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [orderFilter, setOrderFilter] = useState<'newest' | 'oldest' | 'recently_updated' | 'recently_approved' | ''>('');
  const [importStartTime, setImportStartTime] = useState<Date | null>(null);
  const [merchantsKey, setMerchantsKey] = useState(0);
  
  // Get last login time from localStorage
  const [lastLoginTime, setLastLoginTime] = useState<Date | null>(() => {
    if (typeof window !== 'undefined') {
      const lastLogin = localStorage.getItem('lastLoginTime');
      return lastLogin ? new Date(lastLogin) : null;
    }
    return null;
  });
  
  // Initialize updated names from sessionStorage
  const [updatedNames, setUpdatedNames] = useState<{ [credentialId: string]: string }>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('updatedCredentialNames');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  
  // Job monitoring hook
  const { jobStatus, resetMonitor } = useJobMonitor(currentJobId);
  
  // Fetch project credentials using the hook
  const { credentials, isLoading, error } = useProjectCredentials(selectedProject?.id || null);
  
  // Fetch project networks using the hook
  const { networks: networksData, isLoading: networksLoading, error: networksError, refreshNetworks } = useProjectNetworks(selectedProject?.id || null);
  
  // Get network details for merchants API
  const selectedNetworkData = selectedNetwork && networksData && typeof networksData === 'object' && 'networks' in networksData
    ? (networksData.networks as Array<{
        credential_id: string
        network_id: number
        network_name: string
        updated_at: string
        error_message?: string | null
      }>).find(n => n.credential_id === selectedNetwork.id)
    : null;

  // Fetch merchants for selected network
  const { merchants, isLoading: merchantsLoading, error: merchantsError, refreshMerchants } = useProjectMerchants(
    selectedProject?.id || null,
    selectedNetworkData?.network_id?.toString() || null,
    selectedNetwork?.id || null
  );

  // Reset search and filters when network changes
  useEffect(() => {
    setMerchantSearchTerm('');
    setStatusFilter('');
    setPublishedTagFilter('');
    setCurrentPage(1);
  }, [selectedNetwork?.id]);

  // Reset to page 1 when filters or rows per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [merchantSearchTerm, statusFilter, publishedTagFilter, rowsPerPage]);

  // Persist updatedNames to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('updatedCredentialNames', JSON.stringify(updatedNames));
    }
  }, [updatedNames]);

  // Listen for refresh parameter and refresh networks data
  useEffect(() => {
    const refreshed = searchParams.get('refreshed');
    const credentialId = searchParams.get('credentialId');
    const newName = searchParams.get('newName');
    
    if (refreshed) {
      // If we have the new name, update it immediately in local state
      if (credentialId && newName) {
        const decodedName = decodeURIComponent(newName);
        
        // Update the local state with the new credential name
        setUpdatedNames(prev => {
          const updated = {
            ...prev,
            [credentialId]: decodedName
          };
          return updated;
        });
      }
      
      // Refresh the data from server
      if (refreshNetworks) {
        refreshNetworks();
      }
      
      // Clear the parameters from URL without refreshing the page
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('refreshed');
      newUrl.searchParams.delete('credentialId'); 
      newUrl.searchParams.delete('newName');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, refreshNetworks]);

  // Clean up updatedNames when server data matches
  useEffect(() => {
    if (networksData && typeof networksData === 'object' && 'networks' in networksData) {
      const networks = networksData.networks as Array<{
        credential_id: string;
        credential_name?: string;
        updated_at?: string;
      }>;
      
      // Only clean up if we have actual data changes from server
      setUpdatedNames(prev => {
        const newUpdatedNames = { ...prev };
        let hasChanges = false;
        
        Object.keys(newUpdatedNames).forEach(credId => {
          const network = networks.find(n => n.credential_id === credId);
          if (network && network.credential_name === newUpdatedNames[credId]) {
            // Server has caught up, remove from local state
            delete newUpdatedNames[credId];
            hasChanges = true;
          }
        });
        
        // Only return new object if there were actual changes
        return hasChanges ? newUpdatedNames : prev;
      });
    }
  }, [networksData]);

  // Import network functionality
  const handleImportNetwork = async () => {
    if (!selectedNetworkData?.credential_id) {
      return; // Prevent importing if no network selected
    }

    // Track when the import started
    setImportStartTime(new Date());
    
    // Set a temporary job ID immediately to show loader
    setCurrentJobId('starting');

    try {
      const response = await fetch('/api/import-network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          credential_id: selectedNetworkData.credential_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start import');
      }

      const data = await response.json();
      setCurrentJobId(data.job_id); // Start monitoring the job with real ID
    } catch (error) {
      console.error('Import error:', error);
      setCurrentJobId(null); // Reset on error
    }
  };

  // Handle job completion
  useEffect(() => {
    if (jobStatus && (jobStatus.status === 'completed' || jobStatus.status === 'failed')) {
      // Refresh merchants data when job completes
      if (refreshMerchants) {
        refreshMerchants();
      }
    }
  }, [jobStatus, refreshMerchants]);

  // Handle clearing completed/failed jobs
  const handleClearJob = async () => {
    // Update the selected network's timestamp to current time
    if (selectedNetwork && selectedNetworkData) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      setUpdatedTimestamps(prev => ({
        ...prev,
        [selectedNetworkData.credential_id]: currentTimestamp
      }));
      
      // Update the selected network with the new timestamp
      setSelectedNetwork(prev => prev ? { ...prev, updated: currentTimestamp } : null);
    }
    
    // If import was successful, set order filter to newest to show new merchants first
    if (jobStatus && jobStatus.status === 'completed') {
      setOrderFilter('newest');
      
      // Use the import start time minus 1 second as the new "last login" time
      // This ensures all merchants created during the import will show as new
      if (importStartTime) {
        const beforeImport = new Date(importStartTime.getTime() - 1000); // 1 second before import
        localStorage.setItem('lastLoginTime', beforeImport.toISOString());
        setLastLoginTime(beforeImport);
      }
      
      // Clear the entire merchants cache to ensure fresh data
      clearMerchantsCache();
      
      // Force re-render of merchants by updating key
      setMerchantsKey(prev => prev + 1);
      
      // Refresh merchants data to show the newly imported merchants
      // The refreshMerchants function now forces a fresh fetch bypassing all caches
      if (refreshMerchants) {
        await refreshMerchants();
      }
    }
    
    // Only clear local state, let global job monitor handle the job removal
    setCurrentJobId(null);
    resetMonitor();
    setImportStartTime(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.menu-container')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleEditCredential = (credentialId: string) => {
    // Navigate to edit page with credential ID as query parameter
    const currentPath = window.location.pathname;
    const editPath = currentPath + '/edit?credential_id=' + credentialId;
    window.location.href = editPath;
    setOpenMenuId(null);
  };


  
  // Transform networks data to networks format based on actual API response
  const networks: Network[] = networksData && typeof networksData === 'object' && 'networks' in networksData && Array.isArray(networksData.networks)
    ? (networksData.networks as Array<{
        credential_id: string
        network_id: number
        network_name: string
        updated: number
        updated_at: string
        created_at?: string
        error_message?: string | null
        credential_name?: string
      }>).map((network) => ({
        id: network.credential_id,
        name: network.network_name,
        status: network.error_message ? 'inactive' as const : 'active' as const,
        lastChecked: network.updated_at,
        credential_id: network.credential_id,
        network_id: network.network_id,
        updated: new Date(network.updated_at).getTime() / 1000,
        credential_name: updatedNames[network.credential_id] || network.credential_name,
        created_at: network.created_at,
        updated_at: network.updated_at,
      }))
    : [];

  // Group networks by name
  const groupedNetworks: GroupedNetwork[] = networks.reduce((acc, network) => {
    const existingGroup = acc.find(group => group.name === network.name);
    if (existingGroup) {
      existingGroup.instances.push({
        id: network.id,
        status: network.status,
        credential_name: network.credential_name
      });
    } else {
      acc.push({
        name: network.name,
        instances: [{
          id: network.id,
          status: network.status,
          credential_name: network.credential_name
        }]
      });
    }
    return acc;
  }, [] as GroupedNetwork[]);

  const filteredGroupedNetworks = groupedNetworks.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );



  // Show loading state
  if (isLoading) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-xs">Loading project credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <p className="text-red-600 text-xs mb-4">Failed to load project credentials: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show no project selected state
  if (!selectedProject) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Please select a project to view network credentials</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex gap-3">
        {/* Left Column - Networks List */}
        <div className="w-56 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-3 flex flex-col">
          <div className="flex-grow">
            <h2 className="text-xs font-bold mb-2">Networks</h2>
            <input
              type="text"
              placeholder="Search networks..."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="space-y-1 overflow-y-auto">
              {filteredGroupedNetworks.length > 0 ? (
                filteredGroupedNetworks.map((group) => (
                  <li key={group.name}>
                    {group.instances.length > 1 ? (
                      // Multiple instances - show grouped format
                      <div className="mb-1">
                        <div className="font-medium text-xs text-gray-800 px-2 py-1">
                          {group.name}
                        </div>
                        {group.instances.map((instance) => (
                          <div
                            key={instance.id}
                            className={`flex justify-between items-center px-2 py-0.5 ml-3 rounded hover:bg-gray-100 border ${
                              selectedNetwork?.id === instance.id ? 'bg-blue-50 border-blue-200' : 'border-transparent'
                            }`}
                          >
                            <div 
                              className="flex items-center flex-grow min-w-0 cursor-pointer"
                              onClick={() => {
                                const network = networks.find(n => n.id === instance.id);
                                if (network) {
                                  // Apply updated timestamp if available
                                  const updatedTimestamp = updatedTimestamps[network.credential_id];
                                  const networkWithTimestamp = updatedTimestamp 
                                    ? { ...network, updated: updatedTimestamp }
                                    : network;
                                  setSelectedNetwork(networkWithTimestamp);
                                }
                              }}
                            >
                              <span className="text-xs text-gray-500 mr-2">└─</span>
                              <span className="text-xs text-gray-600 truncate">
                                {updatedNames[instance.id] || instance.credential_name || `ID: ${instance.id.substring(0, 16)}...`}
                              </span>
                            </div>
                            <div className="menu-container relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === instance.id ? null : instance.id);
                                }}
                                className="p-0.5 hover:bg-gray-200 rounded translate-y-0.5"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis h-5 w-5 text-gray-500 translate-y-0.5">
                                  <circle cx="12" cy="12" r="1"></circle>
                                  <circle cx="19" cy="12" r="1"></circle>
                                  <circle cx="5" cy="12" r="1"></circle>
                                </svg>
                              </button>
                              {openMenuId === instance.id && (
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                  <button
                                    onClick={() => handleEditCredential(instance.id)}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Single instance - show simple format
                      <div
                        className={`flex justify-between items-center px-2 py-0.5 rounded hover:bg-gray-100 border ${
                          selectedNetwork?.id === group.instances[0].id ? 'bg-blue-50 border-blue-200' : 'border-transparent'
                        }`}
                      >
                        <div 
                          className="flex flex-col flex-grow min-w-0 cursor-pointer"
                          onClick={() => {
                            const network = networks.find(n => n.id === group.instances[0].id);
                            if (network) {
                              // Apply updated timestamp if available
                              const updatedTimestamp = updatedTimestamps[network.credential_id];
                              const networkWithTimestamp = updatedTimestamp 
                                ? { ...network, updated: updatedTimestamp }
                                : network;
                              setSelectedNetwork(networkWithTimestamp);
                            }
                          }}
                        >
                          <span className="font-medium text-xs truncate">{group.name}</span>
                        </div>
                        <div className="menu-container relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === group.instances[0].id ? null : group.instances[0].id);
                            }}
                            className="p-0.5 hover:bg-gray-200 rounded translate-y-0.5"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis h-5 w-5 text-gray-500 translate-y-0.5">
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="19" cy="12" r="1"></circle>
                              <circle cx="5" cy="12" r="1"></circle>
                            </svg>
                          </button>
                          {openMenuId === group.instances[0].id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                              <button
                                onClick={() => handleEditCredential(group.instances[0].id)}
                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                    </div>
                  </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-500 text-xs py-4">
                  {networksLoading 
                    ? 'Loading networks...' 
                    : networksError 
                      ? `Error: ${networksError}`
                      : 'No networks available'
                  }
                </li>
              )}
            </ul>
          </div>
          <Link 
            href="/dashboard/networks/add"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 mt-auto w-full px-2 py-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
            </svg>
            Add new Network
          </Link>
        </div>

        {/* Right Column - Network Details */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
          {selectedNetwork ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-lg font-bold">Merchants for {selectedNetwork.name}</h1>
                {!currentJobId && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      Last Update: {new Date(selectedNetwork.updated * 1000).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      })}, {new Date(selectedNetwork.updated * 1000).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}
                    </div>
                    <div className="text-xs text-gray-400 mt-1" style={{ fontSize: '10px' }}>
                      Credential ID: {selectedNetwork.credential_id}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Merchants Table */}
              <div className="mt-6">
                {!currentJobId && (
                  <h2 className="text-xs font-bold mb-2">Merchants</h2>
                )}
                {!merchantsLoading && !currentJobId && (
                  <div className="flex gap-2 mb-2 justify-between items-center">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search merchants..."
                        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent max-w-xs"
                        value={merchantSearchTerm}
                        onChange={(e) => setMerchantSearchTerm(e.target.value)}
                      />
                      <select
                        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="deleted">Deleted</option>
                        <option value="suspended">Suspended</option>
                        <option value="not joined">Not joined</option>
                      </select>
                      <select
                        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={publishedTagFilter}
                        onChange={(e) => setPublishedTagFilter(e.target.value)}
                      >
                        <option value="">All Tags</option>
                        <option value="Published">Published</option>
                        <option value="Not Published">Not Published</option>
                        {merchants && merchants.merchants && (() => {
                          const uniqueTags = [...new Set(merchants.merchants.map(m => m.published_tag).filter(tag => tag && tag !== 'Published'))].sort();
                          return uniqueTags.length > 0 ? (
                            <>
                              <option disabled>─────────</option>
                              {uniqueTags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                              ))}
                            </>
                          ) : null;
                        })()}
                      </select>
                      <select
                        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={orderFilter}
                        onChange={(e) => setOrderFilter(e.target.value as 'newest' | 'oldest' | 'recently_updated' | 'recently_approved' | '')}
                      >
                        <option value="">Default Order</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="recently_updated">Recently Updated</option>
                        <option value="recently_approved">Recently Approved</option>
                      </select>
                      <button
                        onClick={() => {
                          setMerchantSearchTerm('');
                          setStatusFilter('');
                          setPublishedTagFilter('');
                          setOrderFilter('');
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
                    <button
                      onClick={handleImportNetwork}
                      disabled={!!currentJobId}
                      className={`px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent inline-flex items-center gap-1 ${
                        currentJobId ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                        <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"></path>
                      </svg>
                      {currentJobId ? 'Importing...' : 'Import Merchants'}
                    </button>
                    {currentJobId && (
                      <div className="text-xs text-blue-600 mt-1">
                        You can navigate away - import will continue in background
                      </div>
                    )}
                  </div>
                )}
                {currentJobId ? (
                  <div className="text-center py-12">
                    {currentJobId === 'starting' ? (
                  <div>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Starting import job...</p>
                      </div>
                    ) : jobStatus ? (
                      <div className={`border rounded-lg p-6 max-w-2xl mx-auto ${
                        jobStatus.status === 'completed' ? 'bg-green-50 border-green-200' :
                        jobStatus.status === 'failed' ? 'bg-red-50 border-red-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                                       <div className="flex items-center gap-2 mb-2">
                 <h3 className={`text-sm font-semibold ${
                   jobStatus.status === 'completed' ? 'text-green-900' :
                   jobStatus.status === 'failed' ? 'text-red-900' :
                   'text-blue-900'
                 }`}>
                   {jobStatus.status === 'completed' ? 'Import Completed' :
                    jobStatus.status === 'failed' ? 'Import Failed' :
                    jobStatus.status === 'processing' ? 'Import Processing' :
                    'Import Queued'}
                 </h3>
                 {(jobStatus.status === 'processing' || jobStatus.status === 'queued') && (
                   <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                 )}
               </div>
                        <div className={`space-y-2 text-xs ${
                          jobStatus.status === 'completed' ? 'text-green-800' :
                          jobStatus.status === 'failed' ? 'text-red-800' :
                          'text-blue-800'
                        }`}>
                          <p><span className="font-medium">Job ID:</span> {jobStatus.job_id || 'Missing'}</p>

                          {jobStatus.queue_position !== undefined && (
                            <p><span className="font-medium">Queue Position:</span> {jobStatus.queue_position}</p>
                          )}
                          {jobStatus.progress !== undefined && (
                            <p><span className="font-medium">Progress:</span> {jobStatus.progress}%</p>
                          )}
                                           {jobStatus.message && (
                   <p className={jobStatus.status === 'completed' ? 'text-green-700' : 
                               jobStatus.status === 'failed' ? 'text-red-700' : 'text-blue-700'}>
                     {jobStatus.message}
                   </p>
                 )}
                 {jobStatus.status === 'completed' && jobStatus.result && typeof jobStatus.result === 'object' && (
                   <div className="mt-3 pt-3 border-t border-green-200">
                     <div className="flex items-center gap-2 mb-2">
                       <h4 className="text-xs font-medium text-green-900">Import Results:</h4>
                       {jobStatus.result.success && (
                         <div className="flex items-center gap-1">
                           <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                           <span className="text-xs text-green-700">Completed</span>
                         </div>
                       )}
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                       {jobStatus.result.new_merchants !== undefined && (
                         <div>
                           <span className="font-medium">New Merchants:</span> {jobStatus.result.new_merchants}
                         </div>
                       )}
                       {jobStatus.result.new_approved !== undefined && (
                         <div>
                           <span className="font-medium">New Approved:</span> {jobStatus.result.new_approved}
                         </div>
                       )}
                       {jobStatus.result.deleted_merchants !== undefined && (
                         <div>
                           <span className="font-medium">Deleted Merchants:</span> {jobStatus.result.deleted_merchants}
                         </div>
                       )}
                       {jobStatus.result.new_promotions !== undefined && (
                         <div>
                           <span className="font-medium">New Promotions:</span> {jobStatus.result.new_promotions}
                         </div>
                       )}
                     </div>
                   </div>
                 )}
                          {jobStatus.error && (
                            <p className="text-red-700">{jobStatus.error}</p>
                          )}
                          {jobStatus.queue_info && (
                            <div className="text-xs text-gray-600 mt-2">
                              <p>Queue: {jobStatus.queue_info.currently_processing} processing, {jobStatus.queue_position === 0 ? Math.max(0, jobStatus.queue_info.total_waiting - 1) : jobStatus.queue_info.total_waiting} waiting</p>
                            </div>
                          )}
                        </div>
                        {(jobStatus.status === 'completed' || jobStatus.status === 'failed') && (
                          <button
                            onClick={handleClearJob}
                            className={`mt-4 px-3 py-1 text-xs rounded-md ${
                              jobStatus.status === 'completed' 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            Continue Browsing
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Loading job status...</p>
                      </div>
                    )}
                  </div>
                ) : merchantsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-1"></div>
                    <p className="text-xs text-gray-600">Loading merchants...</p>
                  </div>
                ) : merchantsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-xs">Error: {merchantsError}</p>
                  </div>
                ) : merchants && merchants.merchants.length > 0 ? (
                  (() => {
                    // Filter merchants based on search term and status filter
                    const filteredMerchants = merchants.merchants.filter(merchant => {
                      const matchesSearch = merchant.clean_name.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
                        merchant.status.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
                        merchant.display_url.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
                        (merchant.published_tag && merchant.published_tag.toLowerCase().includes(merchantSearchTerm.toLowerCase()));
                      
                      const matchesStatus = !statusFilter || merchant.status.toLowerCase() === statusFilter.toLowerCase();
                      
                      let matchesPublishedTag = true;
                      if (publishedTagFilter) {
                        if (publishedTagFilter === 'Published') {
                          matchesPublishedTag = merchant.published_tag === 'Published';
                        } else if (publishedTagFilter === 'Not Published') {
                          matchesPublishedTag = !merchant.published_tag || merchant.published_tag === '';
                        } else {
                          matchesPublishedTag = merchant.published_tag === publishedTagFilter;
                        }
                      }
                      
                      return matchesSearch && matchesStatus && matchesPublishedTag;
                    });
                    
                    // Apply ordering to merchants
                    const orderedMerchants = [...filteredMerchants].sort((a, b) => {
                      if (orderFilter === 'newest') {
                        // Sort by created_at descending (newest first)
                        const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
                        const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
                        return bCreated - aCreated;
                      } else if (orderFilter === 'oldest') {
                        // Sort by created_at ascending (oldest first)
                        const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
                        const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
                        return aCreated - bCreated;
                      } else if (orderFilter === 'recently_updated') {
                        // Sort by updated_at descending (most recently updated first)
                        const aUpdated = a.updated_at ? new Date(a.updated_at).getTime() : 0;
                        const bUpdated = b.updated_at ? new Date(b.updated_at).getTime() : 0;
                        return bUpdated - aUpdated;
                      } else if (orderFilter === 'recently_approved') {
                        // First, put approved merchants at the top, then sort by updated_at descending
                        const aIsApproved = a.status.toLowerCase() === 'approved';
                        const bIsApproved = b.status.toLowerCase() === 'approved';
                        
                        // If one is approved and the other isn't, approved comes first
                        if (aIsApproved && !bIsApproved) return -1;
                        if (!aIsApproved && bIsApproved) return 1;
                        
                        // If both have the same approval status, sort by updated_at
                        const aUpdated = a.updated_at ? new Date(a.updated_at).getTime() : 0;
                        const bUpdated = b.updated_at ? new Date(b.updated_at).getTime() : 0;
                        return bUpdated - aUpdated;
                      }
                      // Default: maintain original order
                      return 0;
                    });
                    
                    // Apply pagination
                    const startIndex = (currentPage - 1) * rowsPerPage;
                    const endIndex = startIndex + rowsPerPage;
                    const displayedMerchants = orderedMerchants.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(orderedMerchants.length / rowsPerPage);
                    
                    return orderedMerchants.length > 0 ? (
                  <div key={merchantsKey} className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500"></th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Name</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Status</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Display URL</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Published Tag</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {displayedMerchants.map((merchant) => {
                            const isNew = lastLoginTime && merchant.created_at && new Date(merchant.created_at) > lastLoginTime;
                            return (
                            <tr 
                              key={merchant.id} 
                              className={`hover:bg-gray-50 cursor-pointer ${isNew ? 'bg-green-50' : ''}`}
                              onClick={(e) => {
                                // Don't open panel if clicking on the display URL link
                                const target = e.target as HTMLElement;
                                if (target.tagName === 'A' || target.closest('a')) {
                                  return;
                                }
                                setSelectedMerchant(merchant);
                                setIsPanelOpen(true);
                              }}
                            >
                              <td className="px-2 py-1">
                                <input
                                  type="checkbox"
                                  className="border border-gray-200 rounded text-xs"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td className="px-2 py-1">
                                <div className="text-xs font-medium text-gray-900">{merchant.clean_name}</div>
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap">
                                <span 
                                  className={getStatusBadgeStylesWithFontSize(merchant.status).className}
                                  style={getStatusBadgeStylesWithFontSize(merchant.status).style}
                                >
                                  {merchant.status}
                                </span>
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs">
                                <a href={merchant.display_url} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700">
                                  {(() => {
                                    const cleanUrl = merchant.display_url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\?.*$/, '').replace(/\/$/, '');
                                    return cleanUrl.length > 45 ? cleanUrl.substring(0, 45) + '...' : cleanUrl;
                                  })()}
                                </a>
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs">
                                                 {merchant.published_tag && (
                   <span className="px-1 py-0.5 rounded-full text-xs bg-gray-200 text-gray-800" style={{ fontSize: '10px' }}>
                     {merchant.published_tag}
                   </span>
                 )}
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-xs">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis h-4 w-4">
                                  <circle cx="12" cy="12" r="1"></circle>
                                  <circle cx="19" cy="12" r="1"></circle>
                                  <circle cx="5" cy="12" r="1"></circle>
                                </svg>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                </div>
                    <div className="bg-gray-50 px-2 py-1 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          Showing: {displayedMerchants.length} of {orderedMerchants.length} filtered ({merchants.total_merchants} total) merchants
                        </p>
                        <div className="flex items-center space-x-2">
                          {totalPages > 1 && (
                            <>
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 px-2 py-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                                Previous
                              </button>
                              <span className="text-xs text-gray-500 px-2">
                                Page {currentPage} of {totalPages}
                              </span>
                              <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 px-2 py-1"
                              >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                              </button>
                            </>
                          )}
                          <div className="flex space-x-2">
                          <button
                            disabled={true}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 px-2 py-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"></path>
                            </svg>
                            Hide Selected Rows
                          </button>
                          <button
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 px-2 py-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"></path>
                            </svg>
                            Export to Excel
                          </button>
                          <select
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value={50}>50 rows</option>
                            <option value={100}>100 rows</option>
                            <option value={150}>150 rows</option>
                            <option value={200}>200 rows</option>
                            <option value={250}>250 rows</option>
                            <option value={500}>500 rows</option>
                          </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-gray-500">No merchants match your search</p>
                </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500">No merchants found for this network</p>
              </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="text-center mb-6">
                <div className="text-gray-400 mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Select a network to view details</p>
              </div>
              
              <div>
                <h3 className="text-xs font-medium mb-3">Project Credentials Summary</h3>
                {credentials && typeof credentials === 'object' && 'summary' in credentials ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-center">
                                                  <div className="text-lg font-bold text-blue-700">
                          {(credentials as unknown as ProjectCredentialsResponse).summary.total_credentials}
                        </div>
                          <div className="text-xs text-blue-600 font-medium">Total Credentials</div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-700">
                            {(credentials as unknown as ProjectCredentialsResponse).summary.loaded_credentials}
                          </div>
                          <div className="text-xs text-green-600 font-medium">Loaded</div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-700">
                            {(credentials as unknown as ProjectCredentialsResponse).summary.error_credentials}
                          </div>
                          <div className="text-xs text-red-600 font-medium">Errors</div>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-700">
                            {(credentials as unknown as ProjectCredentialsResponse).summary.outdated_credentials}
                          </div>
                          <div className="text-xs text-yellow-600 font-medium">Outdated</div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-700">
                            {(credentials as unknown as ProjectCredentialsResponse).summary.financial_credentials}
                          </div>
                          <div className="text-xs text-purple-600 font-medium">Financial</div>
                        </div>
                      </div>
                      
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-indigo-700">
                            {(credentials as unknown as ProjectCredentialsResponse).summary.updated_credentials}
                          </div>
                          <div className="text-xs text-indigo-600 font-medium">Updated</div>
                        </div>
                      </div>
                    </div>

                    {/* Error Details Table */}
                    {credentials && 'error_details' in credentials && 
                     Array.isArray((credentials as unknown as ProjectCredentialsResponse).error_details) && 
                     (credentials as unknown as ProjectCredentialsResponse).error_details!.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium mb-3 text-red-700">Credential Errors</h4>
                        <div className="border border-gray-200 rounded-md overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Credential ID
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Network
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Error Message
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {(credentials as unknown as ProjectCredentialsResponse).error_details!.map((errorDetail, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-mono">
                                      {errorDetail.credential_id}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                                      {errorDetail.network_name}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-red-600">
                                      {errorDetail.error_message}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 text-center">
                      {isLoading ? 'Loading...' : error ? `Error: ${error}` : 'No summary data available'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Merchant Details Slide Panel */}
      <SlidePanel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedMerchant(null);
        }}
        initialWidth={40}
        minWidth={20}
        maxWidth={60}
      >
        <MerchantDetailsPanel 
          merchant={selectedMerchant}
          onClose={() => {
            setIsPanelOpen(false);
            setSelectedMerchant(null);
          }}
        />
      </SlidePanel>
    </>
  );
}

// Export a function to clear the cache when needed
export function clearCredentialNamesCache() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('updatedCredentialNames');
  }
}
