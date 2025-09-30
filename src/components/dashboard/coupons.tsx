"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Project } from '../../hooks/use-project-selection';

interface ProjectWithStats extends Project {
  country_name?: string;
  language_name?: string;
}

interface CouponsProps {
  locale?: string;
  selectedProject?: ProjectWithStats | null;
}

interface Coupon {
  campaign: string;
  description: string;
  discount: string;
  discount_type: string;
  end_date: string;
  merchant_id: number;
  merchant_name: string;
  merchant_clean_name?: string;
  network_id: number;
  network_name: string;
  program_id: string;
  project_id: string;
  promotion_id: number;
  published: number;
  start_date: string;
  terms: string;
  title: string;
  updated_at: string;
  url_tracking: string;
  display_url?: string;
  voucher_code: string;
}


// Helper function to convert status codes to user-friendly messages
const getStatusMessage = (status: string, url?: string) => {
  const statusMessages: { [key: string]: string } = {
    'WARMING_UP': 'Warming up the server',
    'SETUP_SELENIUM': 'Setting up a virtual browser',
    'GET_RENDERED_HTML': 'Rendering the HTML',
    'PARSE_HTML': 'Parsing the HTML content',
    'FINAL_URLS': 'Identifying target URLs',
    'PROCESSING_GIVEN_DEAL': 'Processing the deal information',
    'PROCESSING_URL': url ? `Processing ${url}` : 'Processing URL',
    'SENDING_REQUEST_TO_OPENAI': 'Creating the deal',
    'PARSED_OPENAI_RESPONSE': 'Deal created successfully',
    'SCRAPING_COMPLETE': 'Process completed'
  };
  
  return statusMessages[status] || status;
};

export default function DashboardCoupons({ selectedProject }: CouponsProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [hiddenRows, setHiddenRows] = useState<Set<number>>(new Set());
  const [publishingCoupons, setPublishingCoupons] = useState<Set<number>>(new Set());
  
  // Create deal modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState('');
  const [createMessages, setCreateMessages] = useState<string[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdDeals, setCreatedDeals] = useState<Array<{
    title: string;
    description: string;
    coupon?: string;
    valid_from?: string;
    valid_until?: string;
    deal_label?: string;
    deal_conditions?: Array<{
      title: string;
      description: string;
    }>;
    categories?: Array<{
      id: number;
      name: string;
    }>;
  }>>([]);
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  const [showStatusLog, setShowStatusLog] = useState(false);
  const [hideStatusBox, setHideStatusBox] = useState(false);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);

  // Fetch coupons
  const fetchCoupons = useCallback(async () => {
    if (!selectedProject?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/coupons?project_id=${selectedProject.id}&limit=1000&offset=0`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setCoupons(result.data.coupons || []);
      } else {
        throw new Error(result.error || 'Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch coupons');
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject?.id]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Handle publish deal from modal
  const handlePublishDeal = async (deal: {
    title: string;
    description: string;
    coupon?: string;
    valid_from?: string;
    valid_until?: string;
    deal_label?: string;
    deal_conditions?: Array<{
      title: string;
      description: string;
    }>;
    categories?: Array<{
      id: number;
      name: string;
    }>;
  }) => {
    if (!selectedProject?.id) {
      console.error('Project ID is required');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to publish this deal?');
    
    if (!confirmed) {
      return;
    }

    setPublishingCoupons(prev => new Set(prev).add(currentDealIndex));

    try {
      const response = await fetch('/api/coupons/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          deal: JSON.stringify([deal]),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish deal');
      }

      const result = await response.json();
      console.log('Deal published:', result);
      
      // Show success message
      alert('Deal published successfully!');
    } catch (error) {
      console.error('Error publishing deal:', error);
      alert('Failed to publish deal: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setPublishingCoupons(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentDealIndex);
        return newSet;
      });
    }
  };

  // Handle delete coupon
  const handleDeleteCoupon = async (promotionId: number, networkId: number, projectId?: string) => {
    if (!projectId) {
      console.error('Project ID is required');
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.');
    
    if (!confirmed) {
      return;
    }

    // Immediately hide the row
    setHiddenRows(prev => new Set(prev).add(promotionId));

    // Then make the API call to unpublish the coupon
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          action: 'unpublish',
          promotion_id: promotionId,
          network_id: networkId,
          project_id: projectId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unpublish coupon');
      }

      const result = await response.json();
      console.log('Coupon unpublished:', result);
    } catch (error) {
      console.error('Error unpublishing coupon:', error);
      // Optionally, you could show the row again if the API call fails
      // setHiddenRows(prev => {
      //   const newSet = new Set(prev);
      //   newSet.delete(promotionId);
      //   return newSet;
      // });
    }
  };

  // Handle create deal from coupon data
  const handleCreateDeal = async (coupon: Coupon) => {
    if (!selectedProject?.id) {
      setCreateError('Project ID is required');
      return;
    }

    setIsCreating(true);
    setCreateStatus('');
    setCreateMessages([]);
    setCreateError(null);
    setCreatedDeals([]);
    setCurrentDealIndex(0);
    setShowStatusLog(false);
    setHideStatusBox(false);
    setIsProcessingComplete(false);
    setShowCreateModal(true);

    // Map coupon data to the required format
    const dealData = {
      url: coupon.display_url || coupon.url_tracking || 'https://example.com',
      language_code: selectedProject.language_name?.toLowerCase() || 'english',
      country_code: selectedProject.country || 'US',
      language_name: selectedProject.language_name || 'English',
      merchant_name: coupon.merchant_name,
      merchant_clean_name: coupon.merchant_clean_name, // Use clean name if available
      display_url: coupon.display_url, // Use display URL if available
      title: coupon.title,
      voucher_code: coupon.voucher_code || '',
      discount: coupon.discount || coupon.discount_type || '10%', // Use discount or discount_type or fallback
      description: coupon.description,
      end_date: coupon.end_date,
      deal_conditions: coupon.terms || '',
    };

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          action: 'create',
          project_id: selectedProject.id,
          ...dealData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create deal');
      }

      // Handle streaming response
      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      console.log('🚀 Starting stream processing...');
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      setCreateMessages(prev => [...prev, 'Connecting to streaming API...']);
      setCreateStatus('Initializing...');
      
      // Check if response is actually streamable
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let chunkCount = 0;

      // Add timeout to detect stuck streams (increased to 5 minutes)
      const timeoutId = setTimeout(() => {
        console.log('Stream timeout - no activity for 5 minutes');
        setCreateError('Stream timeout - no data received for 5 minutes');
        reader.cancel();
      }, 300000); // 5 minutes

      const processStream = async () => {
        try {
          console.log('📖 Starting to read stream chunks...');
          while (true) {
            console.log('⏳ Reading next chunk...');
            const { done, value } = await reader.read();
            console.log('📊 Read result - done:', done, 'value length:', value ? value.length : 0);
            
            if (done) {
              console.log('Stream finished');
              clearTimeout(timeoutId);
              // Process any remaining data in buffer
              if (buffer.trim()) {
                try {
                  const data = JSON.parse(buffer.trim());
                  if (data.status) {
                    setCreateStatus(data.status);
                    setCreateMessages(prev => [...prev, `Status: ${data.status}`]);
                  }
                  if (data.error) {
                    setCreateError(data.error);
                    setCreateMessages(prev => [...prev, `Error: ${data.error}`]);
                  }
                  if (data.message) {
                    setCreateMessages(prev => [...prev, data.message]);
                  }
                } catch (e) {
                  console.log('JSON parse error for final buffer:', buffer, e);
                }
              }
              break;
            }
            
            // Decode the chunk
            chunkCount++;
            const chunk = decoder.decode(value, { stream: true });
            console.log(`📦 Received chunk ${chunkCount} (${chunk.length} bytes):`, chunk);
            console.log('📊 Chunk preview:', chunk.substring(0, 200) + (chunk.length > 200 ? '...' : ''));
            
            // Add message for first chunk
            if (chunkCount === 1) {
              setCreateMessages(prev => [...prev, 'Data received! Processing status updates...']);
              setCreateStatus('Processing status updates...');
            }
            
            // Add to buffer
            buffer += chunk;
            
            // Split by newlines and process complete lines
            const lines = buffer.split('\n');
            
            // Keep the last incomplete line in buffer
            buffer = lines.pop() || '';
            
            // Process each complete line immediately
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine) {
                console.log('Processing line:', trimmedLine);
                try {
                  const data = JSON.parse(trimmedLine);
                  console.log('Parsed data:', data);
                  
                  // Update status immediately
                  if (data.status) {
                    console.log('🔄 Status update:', data.status);
                    console.log('📋 Full status data:', data);
                    const friendlyMessage = getStatusMessage(data.status, data.url);
                    setCreateStatus(friendlyMessage);
                    const timestamp = new Date().toLocaleTimeString();
                    setCreateMessages(prev => [...prev, `[${timestamp}] ${friendlyMessage}`]);
                    
                    // Capture deal data from PARSED_OPENAI_RESPONSE
                    if (data.status === 'PARSED_OPENAI_RESPONSE' && data.data && data.data.deals) {
                      console.log('💎 Deal data received:', data.data.deals);
                      // Append all deals from the response
                      setCreatedDeals(prev => {
                        const newDeals = [...prev, ...data.data.deals];
                        // Trigger animation to hide status box after first deal
                        if (prev.length === 0 && newDeals.length > 0) {
                          setTimeout(() => {
                            setHideStatusBox(true);
                          }, 1000);
                        }
                        return newDeals;
                      });
                    }
                    
                    // Add special message for completion
                    if (data.status === 'SCRAPING_COMPLETE') {
                      console.log('✅ Scraping completed successfully!');
                      setCreateMessages(prev => [...prev, '✅ All done!']);
                      setIsProcessingComplete(true);
                    }
                  }
                  
                  // Update error immediately
                  if (data.error) {
                    console.log('Setting error:', data.error);
                    setCreateError(data.error);
                    const timestamp = new Date().toLocaleTimeString();
                    setCreateMessages(prev => [...prev, `[${timestamp}] Error: ${data.error}`]);
                  }
                  
                  // Update message immediately
                  if (data.message) {
                    console.log('Setting message:', data.message);
                    const timestamp = new Date().toLocaleTimeString();
                    setCreateMessages(prev => [...prev, `[${timestamp}] ${data.message}`]);
                  }
                } catch (e) {
                  console.log('JSON parse error for line:', trimmedLine, e);
                  // If it's not JSON, treat as plain text message
                  if (trimmedLine) {
                    const timestamp = new Date().toLocaleTimeString();
                    setCreateMessages(prev => [...prev, `[${timestamp}] ${trimmedLine}`]);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream reading error:', error);
          clearTimeout(timeoutId);
          setCreateError('Error reading stream: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
          reader.releaseLock();
        }
      };
      
      // Start processing the stream
      processStream().catch(async (error) => {
        console.error('Stream processing failed, trying fallback:', error);
        clearTimeout(timeoutId);
        
        // Fallback: try to read the response as text
        try {
          const responseClone = response.clone();
          const text = await responseClone.text();
          console.log('Fallback response text:', text);
          setCreateMessages(prev => [...prev, 'Stream failed, using fallback method...']);
          
          // Try to parse as JSON
          try {
            const data = JSON.parse(text);
            if (data.status) {
              setCreateStatus(data.status);
              setCreateMessages(prev => [...prev, `Status: ${data.status}`]);
            }
            if (data.error) {
              setCreateError(data.error);
              setCreateMessages(prev => [...prev, `Error: ${data.error}`]);
            }
            if (data.message) {
              setCreateMessages(prev => [...prev, data.message]);
            }
          } catch {
            // If not JSON, show as plain text
            setCreateMessages(prev => [...prev, text]);
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          setCreateError('Both streaming and fallback methods failed');
        }
      });
      
    } catch (error) {
      console.error('Error creating deal:', error);
      setCreateError(error instanceof Error ? error.message : 'Failed to create deal');
    } finally {
      setIsCreating(false);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, networkFilter, rowsPerPage]);

  // Filter coupons
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = 
      coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.merchant_clean_name && coupon.merchant_clean_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      coupon.voucher_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.terms.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesNetwork = !networkFilter || coupon.network_name === networkFilter;
    
    return matchesSearch && matchesNetwork;
  });

  // Filter out hidden rows from displayed coupons
  const visibleFilteredCoupons = filteredCoupons.filter(coupon => !hiddenRows.has(coupon.promotion_id));

  // Get unique network names for filter
  const networkNames = [...new Set(coupons.map(coupon => coupon.network_name))].sort();

  // Pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedCoupons = visibleFilteredCoupons.slice(startIndex, endIndex);
  const totalPages = Math.ceil(visibleFilteredCoupons.length / rowsPerPage);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Calculate days active
  const calculateDaysActive = (startDate: string) => {
    if (!startDate) return 'N/A';
    try {
      const start = new Date(startDate);
      const today = new Date();
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays : 0;
    } catch {
      return 'N/A';
    }
  };

  // Calculate remaining days active
  const calculateRemainingDays = (endDate: string) => {
    if (!endDate) return 'N/A';
    try {
      const end = new Date(endDate);
      const today = new Date();
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays : 0;
    } catch {
      return 'N/A';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-xs">Loading coupons...</p>
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
            <p className="text-red-600 text-xs mb-4">Failed to load coupons: {error}</p>
            <button 
              onClick={fetchCoupons} 
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
            <p className="text-xs text-gray-500">Please select a project to view coupons</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pl-4 pr-4 pb-6 w-full">
      <div className="bg-white border border-gray-200 rounded-lg p-3 w-full overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-lg font-bold">Coupons</h1>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              Total Coupons: {coupons.length}
            </div>
            <div className="text-xs text-gray-400 mt-1" style={{ fontSize: '10px' }}>
              Project: {selectedProject.name}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 justify-between items-center">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search coupons..."
              className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
            >
              <option value="">All Networks</option>
              {networkNames.map(network => (
                <option key={network} value={network}>{network}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
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
        </div>

        {/* Coupons Table */}
        {visibleFilteredCoupons.length > 0 ? (
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 min-w-32">Title</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 min-w-40">Description</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-24">Merchant</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-20">Network</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-24">Voucher Code</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-20">Start Date</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-20">End Date</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-20">Active</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-24">Remaining</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedCoupons.map((coupon) => (
                    <tr key={coupon.promotion_id} className="hover:bg-gray-50">
                      <td className="px-2 py-1">
                        <div className="text-xs font-medium text-gray-900 max-w-xs truncate" title={coupon.title}>
                          {coupon.title}
                        </div>
                      </td>
                      <td className="px-2 py-1">
                        <div className="text-xs text-gray-600 max-w-xs truncate" title={coupon.description}>
                          {coupon.description}
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        {coupon.merchant_clean_name || coupon.merchant_name}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        {coupon.network_name}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs font-mono">
                        {coupon.voucher_code ? (
                          <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                            {coupon.voucher_code}
                          </span>
                        ) : (
                          <span className="text-gray-400">No Code</span>
                        )}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        {formatDate(coupon.start_date)}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        {formatDate(coupon.end_date)}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        <span className="text-gray-700">
                          {calculateDaysActive(coupon.start_date)} days
                        </span>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        {(() => {
                          const remainingDays = calculateRemainingDays(coupon.end_date);
                          const isNumber = typeof remainingDays === 'number';
                          const colorClass = isNumber 
                            ? remainingDays === 0 
                              ? 'text-red-600' 
                              : remainingDays <= 7 
                              ? 'text-yellow-600' 
                              : 'text-gray-700'
                            : 'text-gray-700';
                          
                          return (
                            <span className={colorClass}>
                              {remainingDays} days
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCreateDeal(coupon)}
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-green-200 bg-white hover:bg-green-50 text-green-600 hover:text-green-700 px-2 py-1"
                            title="Create deal from this coupon"
                            disabled={isCreating}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.promotion_id, coupon.network_id, selectedProject?.id)}
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-red-200 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 px-2 py-1"
                            title="Delete coupon"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                              <path d="M3 6h18"></path>
                              <path d="m19 6-2 14H7L5 6"></path>
                              <path d="m10 11 6-6"></path>
                              <path d="m10 17 6-6"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-2 py-1 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Showing: {displayedCoupons.length} of {visibleFilteredCoupons.length} filtered ({coupons.length} total) coupons
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
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">
              {searchTerm || networkFilter 
                ? 'No coupons match your search criteria' 
                : 'No coupons found for this project'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Deal Status Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-300 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Creating Deal</h2>
              {!isCreating && (
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateStatus('');
                    setCreateMessages([]);
                    setCreateError(null);
                    setCreatedDeals([]);
                    setCurrentDealIndex(0);
                    setShowStatusLog(false);
                    setHideStatusBox(false);
                    setIsProcessingComplete(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Current Status */}
            <div className={`border border-gray-200 rounded-md p-3 bg-gray-50 mb-4 transition-all duration-500 ease-in-out ${
              hideStatusBox ? 'transform -translate-y-full opacity-0 max-h-0 overflow-hidden' : 'transform translate-y-0 opacity-100 max-h-96'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Status</h3>
                {createMessages.length > 0 && (
                  <button
                    onClick={() => setShowStatusLog(!showStatusLog)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {showStatusLog ? 'Hide' : 'Show'} Log
                  </button>
                )}
              </div>
              
              {createStatus && (
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    {isCreating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                    <span className={`text-sm font-medium ${
                      createStatus.includes('COMPLETE') || createStatus.includes('SUCCESS') 
                        ? 'text-green-600' 
                        : createStatus.includes('ERROR') || createStatus.includes('FAILED')
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}>
                      {createStatus}
                    </span>
                  </div>
                </div>
              )}

              {createError && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <strong>Error:</strong> {createError}
                </div>
              )}

              {!isCreating && !createStatus && !createError && createMessages.length === 0 && (
                <p className="text-sm text-gray-500">Initializing deal creation...</p>
              )}

              {isCreating && !createStatus && createMessages.length === 0 && (
                <p className="text-sm text-blue-500">Connecting to API...</p>
              )}

              {isCreating && createStatus === 'Processing...' && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-500">Processing deal creation - this may take a few minutes...</p>
                </div>
              )}
            </div>

            {/* Status Log */}
            {showStatusLog && createMessages.length > 0 && (
              <div className={`border border-gray-200 rounded-md p-3 bg-gray-50 mb-4 transition-all duration-500 ease-in-out ${
                hideStatusBox ? 'transform -translate-y-full opacity-0 max-h-0 overflow-hidden' : 'transform translate-y-0 opacity-100 max-h-40'
              }`}>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Processing Log</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {createMessages.map((message, index) => (
                    <div key={index} className="text-xs text-gray-600 font-mono bg-white p-2 rounded border">
                      {message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Created Deals */}
            {createdDeals.length > 0 && (
              <div className={`border border-green-200 rounded-md p-4 bg-green-50 mb-4 transition-all duration-500 ease-in-out ${
                hideStatusBox ? '-mt-[50px]' : 'mt-0'
              }`}>
                <h3 className="text-sm font-medium text-green-800 mb-3">
                  Deal {currentDealIndex + 1} {createdDeals.length > 1 ? `of ${isProcessingComplete ? createdDeals.length : '(processing)'}` : ''}
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{createdDeals[currentDealIndex].title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{createdDeals[currentDealIndex].description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {createdDeals[currentDealIndex].coupon && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                        Code: {createdDeals[currentDealIndex].coupon}
                      </span>
                    )}
                    {createdDeals[currentDealIndex].deal_label && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {createdDeals[currentDealIndex].deal_label}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Valid from: {createdDeals[currentDealIndex].valid_from ? new Date(createdDeals[currentDealIndex].valid_from).toLocaleDateString() : new Date().toLocaleDateString()}
                    {createdDeals[currentDealIndex].valid_until && (
                      <> - Valid until: {new Date(createdDeals[currentDealIndex].valid_until).toLocaleDateString()}</>
                    )}
                  </div>
                  
                  {createdDeals[currentDealIndex].deal_conditions && createdDeals[currentDealIndex].deal_conditions!.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Conditions:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {createdDeals[currentDealIndex].deal_conditions!.map((condition, index: number) => (
                          <li key={index} className="flex">
                            <span className="font-medium mr-1">{condition.title}:</span>
                            <span>{condition.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {createdDeals[currentDealIndex].categories && createdDeals[currentDealIndex].categories!.length > 0 && (
                    <div className="flex gap-1">
                      {createdDeals[currentDealIndex].categories!.map((category, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation and Action Buttons */}
            {createdDeals.length > 0 && (
              <div className="flex justify-between gap-3 mb-4">
                <button
                  onClick={() => handlePublishDeal(createdDeals[currentDealIndex])}
                  disabled={publishingCoupons.has(currentDealIndex) || isCreating}
                  className="px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishingCoupons.has(currentDealIndex) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 19-7-7 7-7"></path>
                        <path d="M19 12H5"></path>
                      </svg>
                      <span>Publish Deal</span>
                    </>
                  )}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentDealIndex((prev) => prev - 1)}
                    disabled={currentDealIndex === 0}
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                      currentDealIndex === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    Previous Deal
                  </button>
                  <button
                    onClick={() => setCurrentDealIndex((prev) => prev + 1)}
                    disabled={currentDealIndex >= createdDeals.length - 1 && isProcessingComplete}
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2 ${
                      currentDealIndex >= createdDeals.length - 1 && isProcessingComplete
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <span>Next Deal {Math.min(currentDealIndex + 2, createdDeals.length)} / {createdDeals.length}</span>
                    {!isProcessingComplete && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {!isCreating && (
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateStatus('');
                    setCreateMessages([]);
                    setCreateError(null);
                    setCreatedDeals([]);
                    setCurrentDealIndex(0);
                    setShowStatusLog(false);
                    setHideStatusBox(false);
                    setIsProcessingComplete(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
