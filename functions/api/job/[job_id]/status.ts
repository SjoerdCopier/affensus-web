// API endpoint for job status monitoring
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

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

// GET /api/job/[job_id]/status - Get current status of a specific job
export async function onRequestGet(context: { request: Request; env: { AFFENSUS_CREDENTIALS_PASSWORD: string }; params: { job_id: string } }) {
  try {
    const { request, env, params } = context;
    const jobId = params.job_id;
    
    if (!jobId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Job ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use external API
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error('AFFENSUS_CREDENTIALS_PASSWORD not configured');
    }

    console.log('Making API request to:', `https://apiv2.affensus.com/api/job/${jobId}/status`);

    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/job/${jobId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
      throw new Error(`Network error: ${errorMessage}`);
    }

    // Handle 204 No Content response (job completed/deleted)
    if (response.status === 204) {
      return new Response(JSON.stringify({
        job_id: jobId,
        status: 'completed',
        message: 'Job completed successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as JobStatus;
    
    // Ensure job_id is always included in the response
    if (!data.job_id) {
      data.job_id = jobId;
    }
    
    // Parse the result field if it's a string
    if (data.result && typeof data.result === 'string') {
      try {
        const parsedResult = JSON.parse(data.result);
        // Extract import_result if it exists
        if (parsedResult.import_result) {
          data.result = parsedResult.import_result;
        } else {
          data.result = parsedResult;
        }
      } catch (e) {
        console.error('Failed to parse result JSON:', e);
      }
    }
    
    console.log('Job Status API Response:', JSON.stringify(data, null, 2));
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Job status error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
