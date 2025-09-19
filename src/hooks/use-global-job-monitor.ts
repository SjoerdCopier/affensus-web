import { useState, useEffect, useCallback, useRef } from 'react';

export interface JobStatus {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  queue_position?: number;
  progress?: number;
  message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  result?: string | {
    success?: boolean;
    message?: string;
    new_merchants?: number;
    new_approved?: number;
    deleted_merchants?: number;
    new_promotions?: number;
  };
  network_id?: string;
  credential_id?: string;
  project_id?: string;
}

export interface JobMonitorResponse extends JobStatus {
  queue_info: {
    total_queued: number;
    currently_processing: number;
    total_waiting: number;
    average_wait_time?: number;
    estimated_completion?: string;
  };
}

interface GlobalJobMonitorState {
  activeJobs: Map<string, JobMonitorResponse>;
  isLoading: boolean;
  error: string | null;
}

// Global state for job monitoring
const globalState: GlobalJobMonitorState = {
  activeJobs: new Map(),
  isLoading: false,
  error: null,
};

// Listeners for state changes
const listeners = new Set<() => void>();

// Notify all listeners of state changes
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Global job monitoring functions
export const addJob = (jobId: string) => {
  if (!globalState.activeJobs.has(jobId)) {
    globalState.activeJobs.set(jobId, {
      job_id: jobId,
      status: 'queued',
      created_at: new Date().toISOString(),
      queue_info: {
        total_queued: 0,
        currently_processing: 0,
        total_waiting: 0,
      }
    });
    notifyListeners();
  }
};

export const removeJob = (jobId: string) => {
  if (globalState.activeJobs.has(jobId)) {
    globalState.activeJobs.delete(jobId);
    notifyListeners();
  }
};

export const updateJobStatus = (jobId: string, status: JobMonitorResponse) => {
  globalState.activeJobs.set(jobId, status);
  notifyListeners();
};

export const getActiveJobs = () => {
  return Array.from(globalState.activeJobs.values());
};

export const getRunningJobsCount = () => {
  return Array.from(globalState.activeJobs.values()).filter(
    job => job.status === 'queued' || job.status === 'processing'
  ).length;
};

export const hasActiveJobs = () => {
  return getRunningJobsCount() > 0;
};

// Hook for components to subscribe to global job state
export function useGlobalJobMonitor() {
  const [, forceUpdate] = useState({});
  
  const rerender = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, [rerender]);

  return {
    activeJobs: getActiveJobs(),
    runningJobsCount: getRunningJobsCount(),
    hasActiveJobs: hasActiveJobs(),
    addJob,
    removeJob,
    updateJobStatus,
  };
}

// Enhanced job monitor hook for individual jobs
export function useJobMonitor(jobId: string | null) {
  const [jobStatus, setJobStatus] = useState<JobMonitorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);
  const { addJob, removeJob, updateJobStatus } = useGlobalJobMonitor();

  const stopPolling = useCallback(() => {
    isActiveRef.current = false;
    setIsLoading(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchJobStatus = useCallback(async () => {
    if (!jobId || !isActiveRef.current || jobId === 'starting') return;

    try {
      setError(null);
      const response = await fetch(`/api/job/${jobId}/monitor`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch job status: ${response.statusText}`);
      }

      const data = await response.json() as JobMonitorResponse;
      console.log('Client received job status:', data);
      setJobStatus(data);
      
      // Update global state
      updateJobStatus(jobId, data);

      // Stop polling if job is completed or failed
      if (data.status === 'completed' || data.status === 'failed') {
        stopPolling();
        // Remove from global state after a delay to show completion status
        setTimeout(() => {
          removeJob(jobId);
        }, 5000); // Keep in global state for 5 seconds after completion
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching job status:', err);
    }
  }, [jobId, stopPolling, updateJobStatus, removeJob]);

  const startPolling = useCallback(() => {
    if (!jobId || jobId === 'starting') return;
    
    isActiveRef.current = true;
    setIsLoading(true);
    
    // Add to global state
    addJob(jobId);
    
    // Immediate fetch
    fetchJobStatus();
    
    // Set up polling interval (every 2 seconds)
    intervalRef.current = setInterval(fetchJobStatus, 2000);
  }, [jobId, fetchJobStatus, addJob]);

  const resetMonitor = useCallback(() => {
    stopPolling();
    setJobStatus(null);
    setError(null);
    if (jobId) {
      removeJob(jobId);
    }
  }, [stopPolling, jobId, removeJob]);

  // Cleanup on unmount or jobId change
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Start polling when jobId is provided (but not when it's 'starting')
  useEffect(() => {
    if (jobId && jobId !== 'starting') {
      startPolling();
    } else {
      stopPolling();
    }
  }, [jobId, startPolling, stopPolling]);

  return {
    jobStatus,
    isLoading,
    error,
    startPolling,
    stopPolling,
    resetMonitor,
    isPolling: isActiveRef.current
  };
}
