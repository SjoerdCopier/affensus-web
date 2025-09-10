"use client"

import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: number
  project_id: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  updated_at: string
  action_url: string | null
}

export interface ProjectNotifications {
  notifications: Notification[]
  total_notifications: number
}

interface CacheEntry {
  data: ProjectNotifications
  timestamp: number
  expiresAt: number
}

// In-memory cache with 2-minute TTL (shorter for notifications)
const notificationsCache = new Map<string, CacheEntry>()

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<ProjectNotifications>>()

export function useProjectNotifications(projectId: string | null) {
  const [notifications, setNotifications] = useState<ProjectNotifications | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const loadNotifications = useCallback(async () => {
    // Notifications are now provided via props, no need to fetch
    setNotifications(null)
    setIsLoading(false)
    setError(null)
  }, [])

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

  const markAsRead = useCallback(async (notificationId: number) => {
    if (!projectId) return

    try {
      const response = await fetch(`/api/projects/${projectId}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`)
      }

      // Update local state
      setNotifications(prev => {
        if (!prev) return prev
        return {
          ...prev,
          notifications: prev.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        }
      })
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }, [projectId])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  return {
    notifications,
    isLoading,
    error,
    refreshNotifications,
    invalidateCache,
    markAsRead
  }
}

// Utility function to clear all cached notifications data
export function clearNotificationsCache() {
  notificationsCache.clear()
  ongoingRequests.clear()
}
