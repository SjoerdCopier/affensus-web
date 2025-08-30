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

export function useJobMonitor(jobId: string | null) {
  const [jobStatus, setJobStatus] = useState<JobMonitorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

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

      // Stop polling if job is completed or failed
      if (data.status === 'completed' || data.status === 'failed') {
        stopPolling();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching job status:', err);
    }
  }, [jobId, stopPolling]);

  const startPolling = useCallback(() => {
    if (!jobId || jobId === 'starting') return;
    
    isActiveRef.current = true;
    setIsLoading(true);
    
    // Immediate fetch
    fetchJobStatus();
    
    // Set up polling interval (every 2 seconds)
    intervalRef.current = setInterval(fetchJobStatus, 2000);
  }, [jobId, fetchJobStatus]);

  const resetMonitor = useCallback(() => {
    stopPolling();
    setJobStatus(null);
    setError(null);
  }, [stopPolling]);

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
