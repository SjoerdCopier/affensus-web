"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Project } from '../../hooks/use-project-selection';
import { useProjectNotifications } from '../../hooks/use-project-notifications';
import { getStatusBadgeStyles } from '../../lib/status-utils';
import { SlidePanel } from '../ui/slide-panel';
import { MerchantDetailsPanel } from './merchant-details-panel';

interface Merchant {
  id: number;
  clean_name: string;
  status: string;
  display_url: string;
  published_tag?: string;
  created_at?: string;
  updated_at?: string;
  deeplink?: string;
  logo?: string;
  countries?: string[];
  domains?: string;
  program_id?: string;
  identifier_id?: string;
  commission?: {
    payouts?: {
      CPS?: Array<{
        currency: string;
        item: string;
        value: string;
      }>;
      CPA?: Array<{
        currency: string;
        item: string;
        value: string;
      }>;
      CPL?: Array<{
        currency: string;
        item: string;
        value: string;
      }>;
    };
  };
}

interface NotificationsProps {
  selectedProject?: Project | null;
  onNotificationRead?: (notificationId: number) => void;
}

export default function DashboardNotifications({ selectedProject, onNotificationRead }: NotificationsProps) {
  // Get notification ID from URL params
  const [notificationId, setNotificationId] = React.useState<string | null>(null);
  
  // Filter states for all merchant types
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  
  // Panel state
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    setNotificationId(id);
  }, []);

  // Mark notification as read when page loads with a specific notification ID
  React.useEffect(() => {
    if (notificationId && onNotificationRead) {
      const numericId = parseInt(notificationId, 10);
      if (!isNaN(numericId)) {
        onNotificationRead(numericId);
      }
    }
  }, [notificationId, onNotificationRead]);

  const { notificationsData, isLoading, error } = useProjectNotifications(selectedProject?.id || null, notificationId);

  // Helper function to map status values
  const mapStatus = useCallback((status: string): string => {
    if (status.toLowerCase() === 'removed') {
      return 'Deleted';
    }
    return status;
  }, []);

  // Helper function to convert notification merchant to Merchant interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertToMerchant = useCallback((notificationMerchant: any): Merchant => {
    console.log('Converting notification merchant:', notificationMerchant);
    
    // Use commission structure directly if available
    let commission;
    if (notificationMerchant.merchant_commission?.payouts) {
      commission = notificationMerchant.merchant_commission;
    }

    // Map status using helper function
    const status = mapStatus(notificationMerchant.new_status || notificationMerchant.old_status || notificationMerchant.status || '');

    const merchantData = {
      id: notificationMerchant.network_id || 0,
      clean_name: notificationMerchant.merchant_clean_name || notificationMerchant.merchant_name || '',
      status: status,
      display_url: notificationMerchant.merchant_display_url || notificationMerchant.display_url || '',
      program_id: notificationMerchant.program_id || '',
      deeplink: notificationMerchant.merchant_deeplink || undefined,
      logo: notificationMerchant.merchant_logo || undefined,
      created_at: notificationMerchant.first_seen_at,
      updated_at: notificationMerchant.changed_at || notificationMerchant.removed_at,
      commission: commission,
      // Optional fields that may not be available
      published_tag: undefined,
      countries: undefined,
      domains: notificationMerchant.merchant_description,
      identifier_id: undefined
    };

    console.log('Converted merchant data:', merchantData);
    return merchantData;
  }, [mapStatus]);

  // Helper function to check if a merchant matches the filter criteria
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchesFilters = useCallback((merchant: any, statusField: string = 'new_status') => {
    // Filter by search term
    const searchMatch = !searchTerm || 
      merchant.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.program_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (merchant.display_url && merchant.display_url.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (merchant.network_name && merchant.network_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by status
    const statusMatch = !statusFilter || merchant[statusField] === statusFilter;
    
    // Filter by network
    const networkMatch = !networkFilter || 
      (merchant.network_name && merchant.network_name === networkFilter);
    
    return searchMatch && statusMatch && networkMatch;
  }, [searchTerm, statusFilter, networkFilter]);

  // Filter all merchant types based on search and filter criteria
  const filteredNewMerchants = useMemo(() => {
    if (!notificationsData?.new_merchants) return [];
    
    // Get program IDs that appear in status changes and removed merchants
    const statusChangeProgramIds = new Set(
      notificationsData.status_changes?.map(change => change.program_id) || []
    );
    const removedProgramIds = new Set(
      notificationsData.removed_merchants?.map(merchant => merchant.program_id) || []
    );
    
    return notificationsData.new_merchants.filter(merchant => {
      // Exclude merchants that appear in status changes or removed merchants
      if (statusChangeProgramIds.has(merchant.program_id) || removedProgramIds.has(merchant.program_id)) {
        return false;
      }
      
      return matchesFilters(merchant, 'new_status');
    });
  }, [notificationsData?.new_merchants, notificationsData?.status_changes, notificationsData?.removed_merchants, matchesFilters]);

  const filteredStatusChanges = useMemo(() => {
    if (!notificationsData?.status_changes) return [];
    return notificationsData.status_changes.filter(change => matchesFilters(change, 'new_status'));
  }, [notificationsData?.status_changes, matchesFilters]);

  const filteredRemovedMerchants = useMemo(() => {
    if (!notificationsData?.removed_merchants) return [];
    return notificationsData.removed_merchants.filter(merchant => matchesFilters(merchant, 'status'));
  }, [notificationsData?.removed_merchants, matchesFilters]);

  // Debug logging for notifications data
  React.useEffect(() => {
    if (notificationsData) {
      console.log('=== NOTIFICATIONS COMPONENT DEBUG ===');
      console.log('Full notifications data:', JSON.stringify(notificationsData, null, 2));
      
      if (notificationsData.new_merchants && notificationsData.new_merchants.length > 0) {
        console.log('=== NEW MERCHANTS IN COMPONENT ===');
        notificationsData.new_merchants.forEach((merchant, index) => {
          console.log(`New Merchant ${index}:`, {
            merchant_name: merchant.merchant_name,
            display_url: merchant.display_url,
            has_display_url: 'display_url' in merchant
          });
        });
      }
    }
  }, [notificationsData]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-xs">Loading notifications...</p>
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
            <p className="text-red-600 text-xs mb-4">Failed to load notifications: {error}</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 0 0-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0 1 15 0v5z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Please select a project to view notifications</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pl-4 pr-4 pb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-lg font-bold">Notifications</h1>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              Project: {selectedProject.name}
            </div>
          </div>
        </div>
        
        {/* Summary Cards */}
        {notificationsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{notificationsData.summary.total_new_merchants}</div>
              <div className="text-xs text-green-700">New Merchants</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600">{notificationsData.summary.total_status_changes}</div>
              <div className="text-xs text-yellow-700">Status Changes</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">{notificationsData.summary.total_removed_merchants}</div>
              <div className="text-xs text-red-700">Removed Merchants</div>
            </div>
          </div>
        )}

        {/* Metadata */}
        {notificationsData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Refresh Timestamp:</span>
                <span className="ml-2 text-gray-900">{formatTimestamp(notificationsData.metadata.refresh_timestamp)}</span>
              </div>
              <div>
                <span className="text-gray-500">Triggered By:</span>
                <span className="ml-2 text-gray-900">{notificationsData.metadata.refresh_triggered_by}</span>
              </div>
              <div>
                <span className="text-gray-500">Current Merchant Count:</span>
                <span className="ml-2 text-gray-900">{notificationsData.metadata.current_merchant_count}</span>
              </div>
              <div>
                <span className="text-gray-500">Previous Merchant Count:</span>
                <span className="ml-2 text-gray-900">{notificationsData.metadata.previous_merchant_count}</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Filters */}
        {notificationsData && (
          <div className="mb-6">
            <div className="flex gap-2 mb-4 justify-between items-center">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search all merchants..."
                  className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent max-w-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Not joined">Not joined</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Removed">Removed</option>
                </select>
                <select
                  className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={networkFilter}
                  onChange={(e) => setNetworkFilter(e.target.value)}
                >
                  <option value="">All Networks</option>
                  {(() => {
                    const allMerchants = [
                      ...(notificationsData.new_merchants || []),
                      ...(notificationsData.status_changes || []),
                      ...(notificationsData.removed_merchants || [])
                    ];
                    const uniqueNetworks = [...new Set(allMerchants
                      .map(merchant => merchant.network_name)
                      .filter(name => name))].sort();
                    return uniqueNetworks.map(network => (
                      <option key={network} value={network}>{network}</option>
                    ));
                  })()}
                </select>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setNetworkFilter('');
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
              <div className="text-xs text-gray-500">
                Showing {filteredNewMerchants.length + filteredStatusChanges.length + filteredRemovedMerchants.length} of {(notificationsData.new_merchants?.length || 0) + (notificationsData.status_changes?.length || 0) + (notificationsData.removed_merchants?.length || 0)} merchants
              </div>
            </div>
          </div>
        )}

        {/* New Merchants */}
        {notificationsData && filteredNewMerchants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">New Merchants ({filteredNewMerchants.length})</h3>
            
            <div className="space-y-3">
              {filteredNewMerchants.map((merchant, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    const merchantData = convertToMerchant(merchant);
                    setSelectedMerchant(merchantData);
                    setIsPanelOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{merchant.merchant_name}</h4>
                      <p className="text-xs text-gray-500">Program ID: {merchant.program_id}</p>
                      <p className="text-xs text-gray-500">Network: {merchant.network_name || `ID: ${merchant.network_id}`}</p>
                    </div>
                    <div className="flex-1 px-4">
                      <p className="text-xs text-gray-500 mb-1">Website:</p>
                      {merchant.display_url ? (
                        <a href={merchant.display_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs break-all">
                          {merchant.display_url}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-xs">No URL available</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={getStatusBadgeStyles(mapStatus(merchant.new_status))}>
                        {mapStatus(merchant.new_status)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(merchant.first_seen_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Changes */}
        {notificationsData && filteredStatusChanges.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Status Changes ({filteredStatusChanges.length})</h3>
            <div className="space-y-3">
              {filteredStatusChanges.map((change, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    const merchantData = convertToMerchant(change);
                    setSelectedMerchant(merchantData);
                    setIsPanelOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{change.merchant_name}</h4>
                      <p className="text-xs text-gray-500">Program ID: {change.program_id}</p>
                      <p className="text-xs text-gray-500">Network: {change.network_name || `ID: ${change.network_id}`}</p>
                    </div>
                    <div className="flex-1 px-4">
                      <p className="text-xs text-gray-500 mb-1">Website:</p>
                      {change.display_url ? (
                        <a href={change.display_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs break-all">
                          {change.display_url}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-xs">No URL available</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className={getStatusBadgeStyles(mapStatus(change.old_status))}>
                          {mapStatus(change.old_status)}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={getStatusBadgeStyles(mapStatus(change.new_status))}>
                          {mapStatus(change.new_status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(change.changed_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Removed Merchants */}
        {notificationsData && filteredRemovedMerchants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Removed Merchants ({filteredRemovedMerchants.length})</h3>
            <div className="space-y-3">
              {filteredRemovedMerchants.map((merchant, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    const merchantData = convertToMerchant(merchant);
                    setSelectedMerchant(merchantData);
                    setIsPanelOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{merchant.merchant_name}</h4>
                      <p className="text-xs text-gray-500">Program ID: {merchant.program_id}</p>
                      <p className="text-xs text-gray-500">Network: {merchant.network_name || `ID: ${merchant.network_id}`}</p>
                    </div>
                    <div className="flex-1 px-4">
                      <p className="text-xs text-gray-500 mb-1">Website:</p>
                      {merchant.display_url ? (
                        <a href={merchant.display_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs break-all">
                          {merchant.display_url}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-xs">No URL available</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={getStatusBadgeStyles('Deleted')}>
                        Deleted
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(merchant.removed_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notification ID Display */}
        {notificationId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Notification</h3>
            <p className="text-xs text-blue-700">ID: {notificationId}</p>
          </div>
        )}
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
    </div>
  );
}
