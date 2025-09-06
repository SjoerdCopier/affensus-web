"use client"

import { useState, useCallback } from 'react'

export interface Project {
  id: string
  name: string
  country: string
  notifications?: Array<{
    id: number
    project_id: string
    message: string
    type: string
    is_read: boolean
    created_at: string
    updated_at: string
    action_url: string | null
  }>
}

interface UseProjectSelectionReturn {
  selectedProject: Project | null
  setSelectedProject: (project: Project | null) => void
  getStoredProjectId: () => string | null
  clearStoredProject: () => void
  initializeProjectSelection: (projects: Project[]) => Project | null
}

const STORAGE_KEY = 'affensus_selected_project'

export function useProjectSelection(): UseProjectSelectionReturn {
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(null)

  // Get stored project ID from localStorage
  const getStoredProjectId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
      return null
    }
  }, [])

  // Set selected project and store in localStorage
  const setSelectedProject = useCallback((project: Project | null) => {
    setSelectedProjectState(project)
    
    if (typeof window === 'undefined') return
    
    try {
      if (project) {
        localStorage.setItem(STORAGE_KEY, project.id)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('Failed to write to localStorage:', error)
    }
  }, [])

  // Clear stored project
  const clearStoredProject = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(STORAGE_KEY)
      setSelectedProjectState(null)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }, [])

  // Initialize project selection based on stored preference or fallback logic
  const initializeProjectSelection = useCallback((projects: Project[]): Project | null => {
    if (!projects || projects.length === 0) {
      return null
    }

    // Try to restore from localStorage first
    const storedProjectId = getStoredProjectId()
    if (storedProjectId) {
      const storedProject = projects.find(p => p.id === storedProjectId)
      if (storedProject) {
        setSelectedProject(storedProject)
        return storedProject
      }
      // If stored project no longer exists, clear it from storage
      clearStoredProject()
    }

    // Fallback to first project if no valid stored selection
    const firstProject = projects[0]
    setSelectedProject(firstProject)
    return firstProject
  }, [getStoredProjectId, setSelectedProject, clearStoredProject])

  return {
    selectedProject,
    setSelectedProject,
    getStoredProjectId,
    clearStoredProject,
    initializeProjectSelection
  }
}
