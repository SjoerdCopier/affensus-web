"use client";

import React, { useState, useEffect } from 'react';
import { Project } from '../../hooks/use-project-selection';
import { useProjectCredentials } from '../../hooks/use-project-credentials';
import { useProjectNetworks } from '../../hooks/use-project-networks';
import { useProjectMerchants } from '../../hooks/use-project-merchants';
import { useJobMonitor } from '../../hooks/use-job-monitor';
import { getStatusBadgeStylesWithFontSize } from '../../lib/status-utils';

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



export default function DashboardNetworks({ selectedProject }: NetworksProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [merchantSearchTerm, setMerchantSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [publishedTagFilter, setPublishedTagFilter] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [updatedTimestamps, setUpdatedTimestamps] = useState<{ [credentialId: string]: number }>({});
  
  // Job monitoring hook
  const { jobStatus, resetMonitor } = useJobMonitor(currentJobId);
  
  // Fetch project credentials using the hook
  const { credentials, isLoading, error } = useProjectCredentials(selectedProject?.id || null);
  
  // Fetch project networks using the hook
  const { networks: networksData, isLoading: networksLoading, error: networksError } = useProjectNetworks(selectedProject?.id || null);
  
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
  const { merchants, isLoading: merchantsLoading, error: merchantsError } = useProjectMerchants(
    selectedProject?.id || null,
    selectedNetworkData?.network_id?.toString() || null,
    selectedNetwork?.id || null
  );

  // Reset search and filters when network changes
  useEffect(() => {
    setMerchantSearchTerm('');
    setStatusFilter('');
    setPublishedTagFilter('');
  }, [selectedNetwork?.id]);

  // Import network functionality
  const handleImportNetwork = async () => {
    if (!selectedNetworkData?.credential_id || currentJobId) {
      return; // Prevent importing if already importing
    }

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
      // Optionally refresh merchants data here
      // You could call a refresh function or show a success/error message
    }
  }, [jobStatus]);

  // Handle clearing completed/failed jobs
  const handleClearJob = () => {
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
    
    setCurrentJobId(null);
    resetMonitor();
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
    // For now, we'll show the credential details in a simple alert
    // This can be replaced with a modal or navigation to an edit page
    const network = networks.find(n => n.id === credentialId);
    if (network) {
      alert(`Edit credential for ${network.name}\nCredential ID: ${credentialId}`);
    }
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
        credential_name: network.credential_name,
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
                                {instance.credential_name || `ID: ${instance.id.substring(0, 16)}...`}
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
                      <button
                        onClick={() => {
                          setMerchantSearchTerm('');
                          setStatusFilter('');
                          setPublishedTagFilter('');
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
                              <p>Queue: {jobStatus.queue_info.currently_processing} processing, {jobStatus.queue_info.total_waiting} waiting</p>
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
                    
                    return filteredMerchants.length > 0 ? (
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500"></th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Name</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Status</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Display URL</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Published Tag</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredMerchants.map((merchant) => (
                            <tr key={merchant.id} className="hover:bg-gray-50">
                              <td className="px-2 py-1">
                                <input
                                  type="checkbox"
                                  className="border border-gray-200 rounded text-xs"
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                </div>
                    <div className="bg-gray-50 px-2 py-1 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Showing: {filteredMerchants.length} of {merchants.total_merchants} merchants
                      </p>
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
  );
}
