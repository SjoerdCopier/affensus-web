"use client"

import { useState, useEffect, useCallback } from 'react'

interface NewMerchant {
  network_id: number;
  network_name: string;
  new_status: string;
  old_status: string | null;
  program_id: string;
  first_seen_at: string;
  merchant_name: string;
  display_url: string;
}

interface StatusChange {
  network_id: number;
  network_name: string;
  new_status: string;
  old_status: string;
  program_id: string;
  merchant_name: string;
  changed_at: string;
  display_url: string;
}

interface RemovedMerchant {
  network_id: number;
  network_name: string;
  old_status: string;
  program_id: string;
  merchant_name: string;
  removed_at: string;
  display_url: string;
}

interface ApiNewMerchant {
  network_id: number;
  network_name: string;
  new_status: string;
  old_status: string | null;
  program_id: string;
  first_seen_at: string;
  merchant_name: string;
  merchant_display_url: string;
}

interface ApiStatusChange {
  network_id: number;
  network_name: string;
  new_status: string;
  old_status: string;
  program_id: string;
  merchant_name: string;
  changed_at: string;
  merchant_display_url: string;
}

interface ApiRemovedMerchant {
  network_id: number;
  network_name: string;
  old_status: string;
  program_id: string;
  merchant_name: string;
  removed_at: string;
  merchant_display_url: string;
}

interface ProjectNotifications {
  summary: {
    total_new_merchants: number;
    total_status_changes: number;
    total_removed_merchants: number;
  };
  metadata: {
    refresh_timestamp: string;
    refresh_triggered_by: string;
    current_merchant_count: number;
    previous_merchant_count: number;
  };
  change_type: string;
  new_merchants: NewMerchant[];
  status_changes: StatusChange[];
  removed_merchants: RemovedMerchant[];
}

interface CacheEntry {
  data: ProjectNotifications
  timestamp: number
  expiresAt: number
}

// In-memory cache with 5-minute TTL
const notificationsCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<ProjectNotifications>>()

export function useProjectNotifications(projectId: string | null, notificationId?: string | null) {
  const [notificationsData, setNotificationsData] = useState<ProjectNotifications | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async (projectId: string, notificationId?: string): Promise<ProjectNotifications> => {
    const cacheKey = `project_notifications_${projectId}_${notificationId || 'all'}`
    const now = Date.now()

    // Check cache first
    const cached = notificationsCache.get(cacheKey)
    if (cached && now < cached.expiresAt) {
      return cached.data
    }

    // Check if there's an ongoing request for this project
    const ongoing = ongoingRequests.get(cacheKey)
    if (ongoing) {
      return ongoing
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        let response;
        
        if (notificationId) {
          // Fetch specific notification
          response = await fetch(`/api/notifications/${projectId}/${notificationId}`, {
            cache: 'force-cache',
            next: { revalidate: 300 } // 5 minutes
          })
        } else {
          // Fetch all notifications for project
          response = await fetch(`/api/projects/${projectId}/notifications`, {
            cache: 'force-cache',
            next: { revalidate: 300 } // 5 minutes
          })
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch notifications data: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error('Invalid response format')
        }

        // Debug logging for notification data
        console.log('=== FRONTEND NOTIFICATION DEBUG ===');
        console.log('API Response result:', JSON.stringify(result, null, 2));

        let notificationsData: ProjectNotifications;

        if (notificationId) {
          // Transform single notification response to our format
          const notification = result.data.notification;
          const extraData = notification.extra_data;
          
          console.log('=== SINGLE NOTIFICATION TRANSFORM DEBUG ===');
          console.log('Notification:', JSON.stringify(notification, null, 2));
          console.log('Extra data:', JSON.stringify(extraData, null, 2));
          
          // Debug the merchant data specifically
          if (extraData.new_merchants) {
            console.log('=== NEW MERCHANTS IN EXTRA DATA ===');
            extraData.new_merchants.forEach((merchant: ApiNewMerchant, index: number) => {
              console.log(`New Merchant ${index}:`, {
                merchant_name: merchant.merchant_name,
                merchant_display_url: merchant.merchant_display_url,
                has_merchant_display_url: 'merchant_display_url' in merchant,
                all_keys: Object.keys(merchant)
              });
            });
          }
          
          notificationsData = {
            summary: extraData.summary,
            metadata: extraData.metadata,
            change_type: extraData.change_type,
            new_merchants: extraData.new_merchants.map((merchant: ApiNewMerchant) => ({
              network_id: merchant.network_id,
              network_name: merchant.network_name,
              new_status: merchant.new_status,
              old_status: merchant.old_status,
              program_id: merchant.program_id,
              first_seen_at: merchant.first_seen_at,
              merchant_name: merchant.merchant_name,
              display_url: merchant.merchant_display_url
            })),
            status_changes: extraData.status_changes.map((change: ApiStatusChange) => ({
              network_id: change.network_id,
              network_name: change.network_name,
              new_status: change.new_status,
              old_status: change.old_status,
              program_id: change.program_id,
              merchant_name: change.merchant_name,
              changed_at: change.changed_at,
              display_url: change.merchant_display_url
            })),
            removed_merchants: extraData.removed_merchants.map((merchant: ApiRemovedMerchant) => ({
              network_id: merchant.network_id,
              network_name: merchant.network_name,
              old_status: merchant.old_status,
              program_id: merchant.program_id,
              merchant_name: merchant.merchant_name,
              removed_at: merchant.removed_at,
              display_url: merchant.merchant_display_url
            }))
          };
        } else {
          // Use project notifications data directly
          notificationsData = result.data;
        }

        // Cache the result
        notificationsCache.set(cacheKey, {
          data: notificationsData,
          timestamp: now,
          expiresAt: now + CACHE_TTL
        })

        return notificationsData
      } finally {
        // Remove from ongoing requests
        ongoingRequests.delete(cacheKey)
      }
    })()

    // Track the ongoing request
    ongoingRequests.set(cacheKey, requestPromise)

    return requestPromise
  }, [])

  const loadNotifications = useCallback(async () => {
    if (!projectId) {
      setNotificationsData(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchNotifications(projectId, notificationId || undefined)
      setNotificationsData(data)
    } catch (err) {
      console.error('Failed to fetch project notifications data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch project notifications data')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, notificationId, fetchNotifications])

  const invalidateCache = useCallback(() => {
    if (projectId) {
      const cacheKey = `project_notifications_${projectId}`
      notificationsCache.delete(cacheKey)
      ongoingRequests.delete(cacheKey)
    }
  }, [projectId])

  const refreshNotifications = useCallback(async () => {
    invalidateCache()
    await loadNotifications()
  }, [invalidateCache, loadNotifications])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  return {
    notificationsData,
    isLoading,
    error,
    refreshNotifications,
    invalidateCache
  }
}

// Utility function to clear all cached notifications data
export function clearNotificationsCache() {
  notificationsCache.clear()
  ongoingRequests.clear()
}