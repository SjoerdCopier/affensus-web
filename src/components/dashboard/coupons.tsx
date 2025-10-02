"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  external_id?: number;
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
  const [remainingDaysMin, setRemainingDaysMin] = useState('');
  const [remainingDaysMax, setRemainingDaysMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [hiddenRows, setHiddenRows] = useState<Set<number>>(new Set());
  const [publishingCoupons, setPublishingCoupons] = useState<Set<number>>(new Set());
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCoupons, setSelectedCoupons] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    description: false,
    merchant: true,
    network: true,
    extId: false,
    voucherCode: true,
    startDate: true,
    endDate: true,
    active: false,
    remaining: true,
    actions: true
  });
  
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
    merchant_name?: string;
    external_id?: number;
    promotion_id?: number;
    network_id?: number;
  }>>([]);
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  const [showStatusLog, setShowStatusLog] = useState(false);
  const [hideStatusBox, setHideStatusBox] = useState(false);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Modal dragging state
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Ref to store AbortController for streaming requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const streamSessionRef = useRef<number>(0);

  // Handle modal close - abort streaming if active
  const handleCloseModal = useCallback(() => {
    // Abort any ongoing streaming request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Reset all modal states
    setShowCreateModal(false);
    setCreateStatus('');
    setCreateMessages([]);
    setCreateError(null);
    setCreatedDeals([]);
    setCurrentDealIndex(0);
    setShowStatusLog(false);
    setHideStatusBox(false);
    setIsProcessingComplete(false);
    setPublishSuccess(false);
    setIsCreating(false);
    setModalPosition({ x: 0, y: 0 });
  }, []);

  // Handle modal drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!modalRef.current) return;
    
    const rect = modalRef.current.getBoundingClientRect();
    setIsDragging(true);
    
    // Calculate offset from click position to modal's top-left corner
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    
    // Set initial position based on current actual position
    if (modalPosition.x === 0 && modalPosition.y === 0) {
      setModalPosition({
        x: rect.left,
        y: rect.top,
      });
    }
  }, [modalPosition]);

  // Handle modal drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setModalPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

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
    merchant_name?: string;
    external_id?: number;
    promotion_id?: number;
    network_id?: number;
  }) => {
    if (!selectedProject?.id) {
      console.error('Project ID is required');
      return;
    }

    console.log('Publishing deal:', deal);
    console.log('External ID from deal:', deal.external_id);

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
          externalId: deal.external_id ? Number(deal.external_id) : undefined,
          promotionId: deal.promotion_id,
          networkId: deal.network_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish deal');
      }

      const result = await response.json();
      console.log('Deal published:', result);
      
      // Hide the row from the table if we have promotion_id
      if (deal.promotion_id) {
        setHiddenRows(prev => new Set(prev).add(deal.promotion_id!));
      }
      
      // Abort any ongoing streaming request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // Show success UI in modal
      setPublishSuccess(true);
    } catch (error) {
      console.error('Error publishing deal:', error);
      setCreateError('Failed to publish deal: ' + (error instanceof Error ? error.message : String(error)));
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

    console.log('🔍 Creating deal from coupon:', coupon);
    console.log('🔍 Coupon external_id:', coupon.external_id);

    // Abort any ongoing streaming request from previous deal
    if (abortControllerRef.current) {
      console.log('Aborting previous stream');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Increment session ID to invalidate any lingering stream updates
    streamSessionRef.current += 1;
    const currentSessionId = streamSessionRef.current;
    console.log('Starting new stream session:', currentSessionId);

    setIsCreating(true);
    setCreateStatus('');
    setCreateMessages([]);
    setCreateError(null);
    setCreatedDeals([]);
    setCurrentDealIndex(0);
    setShowStatusLog(false);
    setHideStatusBox(false);
    setIsProcessingComplete(false);
    setPublishSuccess(false);
    setShowCreateModal(true);
    
    // Capture coupon identifiers in local variables to avoid state closure issues
    const externalIdToUse = coupon.external_id;
    const promotionIdToUse = coupon.promotion_id;
    const networkIdToUse = coupon.network_id;
    
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
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      
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
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to create deal');
      }

      // Handle streaming response
      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      if (streamSessionRef.current === currentSessionId) {
        setCreateMessages(prev => [...prev, 'Connecting to streaming API...']);
        setCreateStatus('Initializing...');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let chunkCount = 0;

      // Add timeout to detect stuck streams (increased to 5 minutes)
      const timeoutId = setTimeout(() => {
        if (streamSessionRef.current === currentSessionId) {
          console.log('Stream timeout - no activity for 5 minutes');
          setCreateError('Stream timeout - no data received for 5 minutes');
          reader.cancel();
        }
      }, 300000); // 5 minutes

      const processStream = async () => {
        try {
       
          while (true) {
            // Check if this stream session is still active
            if (streamSessionRef.current !== currentSessionId) {
              console.log('Stream session invalidated, stopping processing');
              break;
            }
        
            const { done, value } = await reader.read();
           if (done) {
            
              clearTimeout(timeoutId);
              // Process any remaining data in buffer (only if session is still active)
              if (buffer.trim() && streamSessionRef.current === currentSessionId) {
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
        
            // Add message for first chunk (only if session is still active)
            if (chunkCount === 1 && streamSessionRef.current === currentSessionId) {
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
                try {
                  const data = JSON.parse(trimmedLine);
                  
                  // Update status immediately (only if session is still active)
                  if (data.status && streamSessionRef.current === currentSessionId) {
        
                    const friendlyMessage = getStatusMessage(data.status, data.url);
                    setCreateStatus(friendlyMessage);
                    const timestamp = new Date().toLocaleTimeString();
                    setCreateMessages(prev => [...prev, `[${timestamp}] ${friendlyMessage}`]);
                    
                    // Capture deal data from PARSED_OPENAI_RESPONSE
                    if (data.status === 'PARSED_OPENAI_RESPONSE' && data.data && data.data.deals) {
                     // Append new deals to existing deals and add identifiers to each
                      const dealsWithExternalId = data.data.deals.map((deal: {
                        title: string;
                        description: string;
                        coupon?: string;
                        valid_from?: string;
                        valid_until?: string;
                        deal_label?: string;
                        deal_conditions?: Array<{ title: string; description: string; }>;
                        categories?: Array<{ id: number; name: string; }>;
                      }) => ({
                        ...deal,
                        external_id: externalIdToUse,
                        promotion_id: promotionIdToUse,
                        network_id: networkIdToUse
                      }));
                      
                      setCreatedDeals(prev => [...prev, ...dealsWithExternalId]);
                      
                      // Trigger animation to hide status box after first deal
                      if (dealsWithExternalId.length > 0) {
                        setTimeout(() => {
                          if (streamSessionRef.current === currentSessionId) {
                            setHideStatusBox(true);
                          }
                        }, 1000);
                      }
                    }
                    
                    // Add special message for completion
                    if (data.status === 'SCRAPING_COMPLETE') {
                      setCreateMessages(prev => [...prev, '✅ All done!']);
                      setIsProcessingComplete(true);
                    }
                  }
                  
                  // Update error immediately (only if session is still active)
                  if (data.error && streamSessionRef.current === currentSessionId) {
                    console.log('Setting error:', data.error);
                    setCreateError(data.error);
                    const timestamp = new Date().toLocaleTimeString();
                    setCreateMessages(prev => [...prev, `[${timestamp}] Error: ${data.error}`]);
                  }
                  
                  // Update message immediately (only if session is still active)
                  if (data.message && streamSessionRef.current === currentSessionId) {
                    console.log('Setting message:', data.message);
                    const timestamp = new Date().toLocaleTimeString();
                    setCreateMessages(prev => [...prev, `[${timestamp}] ${data.message}`]);
                  }
                } catch (e) {
                  console.log('JSON parse error for line:', trimmedLine, e);
                  // If it's not JSON, treat as plain text message (only if session is still active)
                  if (trimmedLine && streamSessionRef.current === currentSessionId) {
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
          if (streamSessionRef.current === currentSessionId) {
            setCreateError('Error reading stream: ' + (error instanceof Error ? error.message : String(error)));
          }
        } finally {
          reader.releaseLock();
        }
      };
      
      // Start processing the stream
      processStream().catch(async (error) => {
        console.error('Stream processing failed, trying fallback:', error);
        clearTimeout(timeoutId);
        
        // Only process fallback if this session is still active
        if (streamSessionRef.current !== currentSessionId) {
          console.log('Ignoring fallback for invalidated session');
          return;
        }
        
        // Fallback: try to read the response as text
        try {
          const responseClone = response.clone();
          const text = await responseClone.text();
          console.log('Fallback response text:', text);
          
          if (streamSessionRef.current === currentSessionId) {
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
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          if (streamSessionRef.current === currentSessionId) {
            setCreateError('Both streaming and fallback methods failed');
          }
        }
      });
      
    } catch (error) {
      // Don't show error if request was aborted by user
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Deal creation was cancelled by user');
        return;
      }
      
      console.error('Error creating deal:', error);
      if (streamSessionRef.current === currentSessionId) {
        setCreateError(error instanceof Error ? error.message : 'Failed to create deal');
      }
    } finally {
      if (streamSessionRef.current === currentSessionId) {
        setIsCreating(false);
      }
      abortControllerRef.current = null;
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, networkFilter, remainingDaysMin, remainingDaysMax, rowsPerPage]);

  // Close column selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showColumnSelector && !target.closest('.relative')) {
        setShowColumnSelector(false);
      }
    };

    if (showColumnSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showColumnSelector]);

  // Calculate days active
  const calculateDaysActive = useCallback((startDate: string) => {
    if (!startDate) return 'N/A';
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Normalize to midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to midnight
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays : 0;
    } catch {
      return 'N/A';
    }
  }, []);

  // Calculate remaining days active
  const calculateRemainingDays = useCallback((endDate: string) => {
    if (!endDate) return 'N/A';
    try {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0); // Normalize to midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to midnight
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays : 0;
    } catch {
      return 'N/A';
    }
  }, []);

  // Filter coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon => {
      const matchesSearch = 
        coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (coupon.merchant_clean_name && coupon.merchant_clean_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        coupon.voucher_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.terms.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesNetwork = !networkFilter || coupon.network_name === networkFilter;
      
      // Filter by remaining days
      let matchesRemainingDays = true;
      if (remainingDaysMin !== '' || remainingDaysMax !== '') {
        const remaining = calculateRemainingDays(coupon.end_date);
        if (typeof remaining === 'number') {
          if (remainingDaysMin !== '' && remaining < Number(remainingDaysMin)) {
            matchesRemainingDays = false;
          }
          if (remainingDaysMax !== '' && remaining > Number(remainingDaysMax)) {
            matchesRemainingDays = false;
          }
        } else {
          // If remaining is 'N/A', exclude it from the filter
          matchesRemainingDays = false;
        }
      }
      
      return matchesSearch && matchesNetwork && matchesRemainingDays;
    });
  }, [coupons, searchTerm, networkFilter, remainingDaysMin, remainingDaysMax, calculateRemainingDays]);

  // Apply sorting
  const sortedCoupons = useMemo(() => {
    if (!sortField) return filteredCoupons;
    
    return [...filteredCoupons].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'merchant':
          aValue = a.merchant_clean_name || a.merchant_name;
          bValue = b.merchant_clean_name || b.merchant_name;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'network':
          aValue = a.network_name;
          bValue = b.network_name;
          break;
        case 'voucherCode':
          aValue = a.voucher_code;
          bValue = b.voucher_code;
          break;
        case 'startDate':
          aValue = new Date(a.start_date).getTime();
          bValue = new Date(b.start_date).getTime();
          break;
        case 'endDate':
          aValue = new Date(a.end_date).getTime();
          bValue = new Date(b.end_date).getTime();
          break;
        case 'active':
          aValue = calculateDaysActive(a.start_date);
          bValue = calculateDaysActive(b.start_date);
          // Convert 'N/A' to -1 for sorting
          aValue = aValue === 'N/A' ? -1 : aValue;
          bValue = bValue === 'N/A' ? -1 : bValue;
          break;
        case 'remaining':
          aValue = calculateRemainingDays(a.end_date);
          bValue = calculateRemainingDays(b.end_date);
          // Convert 'N/A' to -1 for sorting
          aValue = aValue === 'N/A' ? -1 : aValue;
          bValue = bValue === 'N/A' ? -1 : bValue;
          break;
        default:
          return 0;
      }

      // Handle string vs number comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const comparison = (aValue as number) - (bValue as number);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    });
  }, [filteredCoupons, sortField, sortDirection, calculateDaysActive, calculateRemainingDays]);

  // Filter out hidden rows from displayed coupons
  const visibleFilteredCoupons = useMemo(() => {
    return sortedCoupons.filter(coupon => !hiddenRows.has(coupon.promotion_id));
  }, [sortedCoupons, hiddenRows]);

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

  // Handle sorting
  const handleSort = useCallback((field: string) => {
    setSortField(prevField => {
      if (prevField === field) {
        // Same field - toggle direction
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        // New field - set to ascending
        setSortDirection('asc');
      }
      return field;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(displayedCoupons.map(c => c.promotion_id));
      setSelectedCoupons(allIds);
    } else {
      setSelectedCoupons(new Set());
    }
  }, [displayedCoupons]);

  // Handle select coupon
  const handleSelectCoupon = useCallback((promotionId: number, checked: boolean) => {
    setSelectedCoupons(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(promotionId);
      } else {
        newSet.delete(promotionId);
      }
      return newSet;
    });
  }, []);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedCoupons.size === 0) return;

    const confirmed = window.confirm(`Are you sure you want to delete ${selectedCoupons.size} coupon(s)? This action cannot be undone.`);
    
    if (!confirmed) {
      return;
    }

    // Hide all selected rows immediately
    setHiddenRows(prev => {
      const newSet = new Set(prev);
      selectedCoupons.forEach(id => newSet.add(id));
      return newSet;
    });

    // Clear selection
    setSelectedCoupons(new Set());
    setBulkAction('');

    // Delete each coupon one by one in the background
    const couponsToDelete = displayedCoupons.filter(c => selectedCoupons.has(c.promotion_id));
    
    for (const coupon of couponsToDelete) {
      try {
        const response = await fetch('/api/coupons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            action: 'unpublish',
            promotion_id: coupon.promotion_id,
            network_id: coupon.network_id,
            project_id: selectedProject?.id,
          }),
        });

        if (!response.ok) {
          console.error(`Failed to delete coupon ${coupon.promotion_id}`);
        } else {
          console.log(`Coupon ${coupon.promotion_id} deleted successfully`);
        }
      } catch (error) {
        console.error(`Error deleting coupon ${coupon.promotion_id}:`, error);
      }
    }
  }, [selectedCoupons, displayedCoupons, selectedProject?.id]);

  // Handle bulk action change
  const handleBulkActionChange = useCallback((action: string) => {
    setBulkAction(action);
    if (action === 'delete') {
      handleBulkDelete();
    }
  }, [handleBulkDelete]);

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
          <div className="flex gap-2 flex-wrap">
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
            <div className="flex gap-1 items-center">
              <input
                type="number"
                placeholder="Min days"
                className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-20"
                value={remainingDaysMin}
                onChange={(e) => setRemainingDaysMin(e.target.value)}
                min="0"
              />
              <span className="text-xs text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max days"
                className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-20"
                value={remainingDaysMax}
                onChange={(e) => setRemainingDaysMax(e.target.value)}
                min="0"
              />
              <span className="text-xs text-gray-500">remaining</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 px-2 py-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <line x1="9" x2="9" y1="3" y2="21"></line>
                </svg>
                Columns
              </button>
              {showColumnSelector && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="p-2 space-y-1">
                    <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.merchant}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, merchant: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">Merchant</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.title}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, title: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">Title</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.description}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, description: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">Description</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.network}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, network: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">Network</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.extId}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, extId: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">Ext ID</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.voucherCode}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, voucherCode: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">Voucher Code</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.startDate}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, startDate: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">Start Date</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.endDate}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, endDate: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">End Date</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.active}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, active: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">Active</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.remaining}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, remaining: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">Remaining</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.actions}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, actions: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs">Actions</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setNetworkFilter('');
                setRemainingDaysMin('');
                setRemainingDaysMax('');
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
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-10">
                      <input
                        type="checkbox"
                        checked={displayedCoupons.length > 0 && displayedCoupons.every(c => selectedCoupons.has(c.promotion_id))}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </th>
                    {visibleColumns.merchant && (
                      <th 
                        className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-32 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('merchant')}
                      >
                        <div className="flex items-center gap-1">
                          Merchant
                          {sortField === 'merchant' && (
                            <span className="text-gray-400">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                    {visibleColumns.title && (
                      <th 
                        className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-48 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center gap-1">
                          Title
                          {sortField === 'title' && (
                            <span className="text-gray-400">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                    {visibleColumns.description && <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 min-w-40">Description</th>}
                    {visibleColumns.network && (
                      <th 
                        className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-20 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('network')}
                      >
                        <div className="flex items-center gap-1">
                          Network
                          {sortField === 'network' && (
                            <span className="text-gray-400">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                    {visibleColumns.extId && <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-16">Ext ID</th>}
                    {visibleColumns.voucherCode && (
                      <th 
                        className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-24 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('voucherCode')}
                      >
                        <div className="flex items-center gap-1">
                          Voucher Code
                          {sortField === 'voucherCode' && (
                            <span className="text-gray-400">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                    {visibleColumns.startDate && (
                      <th 
                        className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-20 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('startDate')}
                      >
                        <div className="flex items-center gap-1">
                          Start Date
                          {sortField === 'startDate' && (
                            <span className="text-gray-400">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                    {visibleColumns.endDate && (
                      <th 
                        className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-20 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('endDate')}
                      >
                        <div className="flex items-center gap-1">
                          End Date
                          {sortField === 'endDate' && (
                            <span className="text-gray-400">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                    {visibleColumns.active && (
                      <th 
                        className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-20 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('active')}
                      >
                        <div className="flex items-center gap-1">
                          Active
                          {sortField === 'active' && (
                            <span className="text-gray-400">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                    {visibleColumns.remaining && (
                      <th 
                        className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-24 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('remaining')}
                      >
                        <div className="flex items-center gap-1">
                          Remaining
                          {sortField === 'remaining' && (
                            <span className="text-gray-400">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                    {visibleColumns.actions && <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 w-16">Actions</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedCoupons.map((coupon) => (
                    <tr key={coupon.promotion_id} className="hover:bg-gray-50">
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        <input
                          type="checkbox"
                          checked={selectedCoupons.has(coupon.promotion_id)}
                          onChange={(e) => handleSelectCoupon(coupon.promotion_id, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      {visibleColumns.merchant && (
                        <td className="px-2 py-1 whitespace-nowrap text-xs">
                          {coupon.merchant_clean_name || coupon.merchant_name}
                        </td>
                      )}
                      {visibleColumns.title && (
                        <td className="px-2 py-1">
                          <div className="text-xs font-medium text-gray-900 max-w-xs truncate" title={coupon.title}>
                            {coupon.title}
                          </div>
                        </td>
                      )}
                      {visibleColumns.description && (
                        <td className="px-2 py-1">
                          <div className="text-xs text-gray-600 max-w-xs truncate" title={coupon.description}>
                            {coupon.description}
                          </div>
                        </td>
                      )}
                      {visibleColumns.network && (
                        <td className="px-2 py-1 whitespace-nowrap text-xs">
                          {coupon.network_name}
                        </td>
                      )}
                      {visibleColumns.extId && (
                        <td className="px-2 py-1 whitespace-nowrap text-xs">
                          {coupon.external_id || '-'}
                        </td>
                      )}
                      {visibleColumns.voucherCode && (
                        <td className="px-2 py-1 whitespace-nowrap text-xs font-mono">
                          {coupon.voucher_code ? (
                            <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                              {coupon.voucher_code}
                            </span>
                          ) : (
                            <span className="text-gray-400">No Code</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.startDate && (
                        <td className="px-2 py-1 whitespace-nowrap text-xs">
                          {formatDate(coupon.start_date)}
                        </td>
                      )}
                      {visibleColumns.endDate && (
                        <td className="px-2 py-1 whitespace-nowrap text-xs">
                          {formatDate(coupon.end_date)}
                        </td>
                      )}
                      {visibleColumns.active && (
                        <td className="px-2 py-1 whitespace-nowrap text-xs">
                          <span className="text-gray-700">
                            {calculateDaysActive(coupon.start_date)} days
                          </span>
                        </td>
                      )}
                      {visibleColumns.remaining && (
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
                      )}
                      {visibleColumns.actions && (
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
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-2 py-1 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <p className="text-xs text-gray-500">
                    Showing: {displayedCoupons.length} of {visibleFilteredCoupons.length} filtered ({coupons.length} total) coupons
                  </p>
                  {selectedCoupons.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">
                        {selectedCoupons.size} selected
                      </span>
                      <select
                        value={bulkAction}
                        onChange={(e) => handleBulkActionChange(e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Actions...</option>
                        <option value="delete">Delete selected coupons</option>
                      </select>
                    </div>
                  )}
                </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-300 shadow-lg"
            style={{
              position: 'fixed',
              left: modalPosition.x !== 0 ? `${modalPosition.x}px` : '50%',
              top: modalPosition.y !== 0 ? `${modalPosition.y}px` : '50%',
              transform: modalPosition.x === 0 && modalPosition.y === 0 ? 'translate(-50%, -50%)' : 'none',
              cursor: isDragging ? 'grabbing' : 'default',
            }}
          >
            <div 
              className="flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
            >
              <h2 className="text-lg font-bold select-none">Creating Deal</h2>
              {!isCreating && (
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Current Status */}
            {!publishSuccess && (
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
            )}

            {/* Status Log */}
            {!publishSuccess && showStatusLog && createMessages.length > 0 && (
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

            {/* Success UI */}
            {publishSuccess && (
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Deal Published Successfully!</h3>
                <p className="text-gray-600 mb-6">Your deal has been published to the external platform.</p>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {/* Created Deals */}
            {createdDeals.length > 0 && !publishSuccess && (
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
            {createdDeals.length > 0 && !publishSuccess && (
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
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16 6 12 2 8 6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                      </svg>
                      <span>Publish Deal</span>
                    </>
                  )}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentDealIndex((prev) => prev - 1)}
                    disabled={currentDealIndex === 0 || publishingCoupons.has(currentDealIndex)}
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                      currentDealIndex === 0 || publishingCoupons.has(currentDealIndex)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    Previous Deal
                  </button>
                  <button
                    onClick={() => setCurrentDealIndex((prev) => prev + 1)}
                    disabled={(currentDealIndex >= createdDeals.length - 1 && isProcessingComplete) || publishingCoupons.has(currentDealIndex)}
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2 ${
                      (currentDealIndex >= createdDeals.length - 1 && isProcessingComplete) || publishingCoupons.has(currentDealIndex)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {!isProcessingComplete && currentDealIndex >= createdDeals.length - 1 ? (
                      <>
                        <span>Loading next deal...</span>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </>
                    ) : (
                      <span>Next Deal {Math.min(currentDealIndex + 2, createdDeals.length)} / {isProcessingComplete ? createdDeals.length : '...'}</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {!isCreating && !publishSuccess && (
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleCloseModal}
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
