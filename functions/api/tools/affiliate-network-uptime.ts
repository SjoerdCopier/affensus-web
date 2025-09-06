export interface Env {
  UPTIME_KUMA_SECRET: string;
  UPTIME_KUMA_URL?: string;
}

interface StatusPageHeartbeat {
  status: number;
  time: string;
  msg: string;
  ping: number;
}

interface StatusPageResponse {
  heartbeatList: {
    [key: string]: StatusPageHeartbeat[];
  };
  uptimeList: {
    [key: string]: number;
  };
}

interface UrlData {
  type: string;
  avg_uptime_percentage: number;
  avg_response_time: number;
  hasStatusPage: boolean;
  heartbeats?: StatusPageHeartbeat[];
  uptimeList?: { [key: string]: number };
}

interface Domain {
  domain: string;
  displayName: string;
  dashboardId?: string; // The monitor ID from Uptime Kuma
  originalName?: string; // Original monitor name for status page lookup
  avg_uptime_percentage: number;
  urls: UrlData[];
  day_uptime: { type: string; day_uptime: { date: string; uptime: number | null }[] }[];
  hasStatusPage: boolean;
  uptimeList?: { [key: string]: number };
}

export async function onRequestGet(context: { env: Env, request: Request }): Promise<Response> {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const debug = url.searchParams.get('debug') === 'true';
    
    const uptimeKumaSecret = env.UPTIME_KUMA_SECRET;

    if (!uptimeKumaSecret) {
      return new Response(JSON.stringify({ error: 'Uptime Kuma secret not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Debug mode - return environment info
    if (debug) {
      // Try to fetch data and include network count in debug response
      let networkCount = 0;
      let fetchError = null;
      
      try {
        const uptimeKumaUrl = env.UPTIME_KUMA_URL || 'http://uptime.affensus.com:3001';
        const monitorsResponse = await fetch(`${uptimeKumaUrl}/metrics`, {
          headers: {
            'Authorization': `Basic ${btoa(':' + uptimeKumaSecret)}`,
            'Accept': 'text/plain'
          }
        });
        
        if (monitorsResponse.ok) {
          const metricsText = await monitorsResponse.text();
          if (!metricsText.startsWith('<!DOCTYPE') && !metricsText.includes('<html')) {
            const processedDomains = await processPrometheusMetrics(metricsText, env.UPTIME_KUMA_URL);
            networkCount = processedDomains.length;
          }
        } else {
          fetchError = `HTTP ${monitorsResponse.status}: ${monitorsResponse.statusText}`;
        }
      } catch (error) {
        fetchError = error instanceof Error ? error.message : 'Unknown error';
      }
      
      return new Response(JSON.stringify({
        environment: typeof caches !== 'undefined' ? 'cloudflare' : 'local',
        hasSecret: !!uptimeKumaSecret,
        uptimeKumaUrl: env.UPTIME_KUMA_URL || 'http://uptime.affensus.com:3001',
        networkCount,
        fetchError,
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, must-revalidate'
        }
      });
    }

    // Try multiple endpoints to get data from Uptime Kuma
    let metricsText = '';
    let success = false;

    // First try the metrics endpoint with Basic Auth
    const uptimeKumaUrl = env.UPTIME_KUMA_URL || 'http://uptime.affensus.com:3001';
    const metricsUrl = `${uptimeKumaUrl}/metrics`;
    
    console.log('Fetching from:', metricsUrl);
    
    try {
      const monitorsResponse = await fetch(metricsUrl, {
        headers: {
          'Authorization': `Basic ${btoa(':' + uptimeKumaSecret)}`,
          'Accept': 'text/plain'
        }
      });

      console.log('Response status:', monitorsResponse.status, monitorsResponse.statusText);

      if (monitorsResponse.ok) {
        metricsText = await monitorsResponse.text();
        console.log('Metrics text length:', metricsText.length);
        console.log('First 200 chars:', metricsText.substring(0, 200));
        
        // Check if we got HTML instead of metrics
        if (metricsText.startsWith('<!DOCTYPE') || metricsText.includes('<html')) {
          console.log('Received HTML instead of metrics');
        } else {
          success = true;
          console.log('Successfully fetched metrics data');
        }
      } else {
        console.error('Metrics endpoint failed:', monitorsResponse.status, monitorsResponse.statusText);
        const errorText = await monitorsResponse.text();
        console.error('Error response:', errorText.substring(0, 500));
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }

    if (!success) {
      
      // Check if we're in Cloudflare environment and the issue is network access
      const isCloudflareEnv = typeof caches !== 'undefined';
      const usingPrivateIp = !env.UPTIME_KUMA_URL && isCloudflareEnv;
      
      let errorMessage = 'Unable to fetch data from Uptime Kuma';
      if (usingPrivateIp) {
        errorMessage += ' - Unable to access Uptime Kuma server. Please check network connectivity.';
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        debug: {
          environment: isCloudflareEnv ? 'cloudflare' : 'local',
          hasPublicUrl: !!env.UPTIME_KUMA_URL,
          suggestedAction: usingPrivateIp ? 'Configure UPTIME_KUMA_URL environment variable' : 'Check network connectivity'
        }
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-store, must-revalidate'
        }
      });
    }

    // Process the Prometheus metrics to match our expected format
    const processedDomains = await processPrometheusMetrics(metricsText, env.UPTIME_KUMA_URL);
    
    console.log(`Processed ${processedDomains.length} domains`);
    console.log('Domain names:', processedDomains.map(d => d.displayName || d.domain));

    return new Response(JSON.stringify(processedDomains), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Error in affiliate-network-uptime API:', error);
    
    // Return error instead of mock data
    return new Response(JSON.stringify({ error: 'Failed to fetch real uptime data: ' + (error instanceof Error ? error.message : 'Unknown error') }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function formatNetworkDisplayName(networkName: string): string {
  const nameMappings: { [key: string]: string } = {
    'involveasia': 'Involve Asia',
    'partnerads': 'Partner Ads',
    'retailads': 'Retail Ads',
    'smartresponse': 'Smart Response',
    'takeads': 'Take Ads'
  };
  
  const normalizedName = networkName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return nameMappings[normalizedName] || networkName;
}

async function fetchStatusPageData(networkName: string, uptimeKumaUrl?: string): Promise<StatusPageResponse | null> {
  try {
    const url = `${uptimeKumaUrl || 'http://uptime.affensus.com:3001'}/api/status-page/heartbeat/${networkName}?limit=10080`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error(`Error fetching status page data for ${networkName}:`, error);
    return null;
  }
}

async function processPrometheusMetrics(metricsText: string, uptimeKumaUrl?: string): Promise<Domain[]> {
  const domains: Map<string, Domain> = new Map();
  const lines = metricsText.split('\n');

  // Parse Prometheus metrics
  const monitors: Map<string, any> = new Map();

  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue;

    // Parse metric lines like: metric_name{label1="value1",label2="value2"} value
    const metricMatch = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\{([^}]*)\}\s+(.+)$/);
    if (!metricMatch) continue;

    const [, metricName, labelsStr, value] = metricMatch;
    
    // Parse labels
    const labels: { [key: string]: string } = {};
    const labelMatches = labelsStr.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)="([^"]*)"/g);
    for (const labelMatch of labelMatches) {
      labels[labelMatch[1]] = labelMatch[2];
    }
    
    const monitorName = labels.monitor_name || labels.job || 'unknown';
    
    // Skip group monitors or invalid ones
    if (labels.monitor_type === 'group' || monitorName === 'unknown') continue;

    if (!monitors.has(monitorName)) {
      monitors.set(monitorName, {
        name: monitorName,
        type: labels.monitor_type || 'http',
        url: labels.monitor_url || '',
        monitorId: labels.monitor_id || labels.monitor || '', // Extract monitor ID from labels
        metrics: {}
      });
    }

    const monitor = monitors.get(monitorName)!;
    monitor.metrics[metricName] = parseFloat(value);
  }

  // Process monitors into domains
  for (const monitor of monitors.values()) {
    const domain = monitor.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (!domains.has(domain)) {
      domains.set(domain, {
        domain,
        displayName: formatNetworkDisplayName(monitor.name),
        dashboardId: monitor.monitorId, // Include the monitor ID
        originalName: monitor.name, // Preserve original name for status page
        avg_uptime_percentage: 0,
        urls: [],
        day_uptime: [],
        hasStatusPage: false
      });
    }

    const domainData = domains.get(domain)!;

    // Extract metrics - using the actual metric names from Uptime Kuma
    const status = monitor.metrics['monitor_status'] || 0; // 1 = UP, 0 = DOWN
    const responseTime = monitor.metrics['monitor_response_time'] || 0;
    
    // Calculate uptime percentage based on actual status
    const uptimePercentage = status === 1 ? 100 : 0;

    // Add URL data - treating each monitor as a "Tracking" endpoint since they're all tracking URLs
    domainData.urls.push({
      type: 'Tracking',
      avg_uptime_percentage: uptimePercentage,
      avg_response_time: responseTime,
      hasStatusPage: false
    });

    // Only include today's data since we don't have historical data
    const today = new Date().toISOString().split('T')[0];
    domainData.day_uptime.push({
      type: 'Tracking',
      day_uptime: [{
        date: today,
        uptime: uptimePercentage / 100
      }]
    });
  }

  // Fetch status page data for each domain and only keep those with status pages
  const domainsWithStatusPages: Domain[] = [];
  
  for (const domain of domains.values()) {
    // Try multiple variations of the network name for status page
    const namesToTry = [
      domain.domain, // normalized name (e.g., "involveasia")
      domain.originalName, // original name from monitor (e.g., "InvolveAsia")
      domain.displayName?.replace(/\s+/g, '').toLowerCase(), // display name without spaces
      domain.displayName?.replace(/\s+/g, '-').toLowerCase(), // display name with hyphens
    ].filter(name => name); // Remove undefined values
    
    let statusPageData = null;
    for (const networkName of namesToTry) {
      if (!networkName) continue; // Skip undefined names
      statusPageData = await fetchStatusPageData(networkName, uptimeKumaUrl);
      if (statusPageData && statusPageData.heartbeatList && Object.keys(statusPageData.heartbeatList).length > 0) {
        break;
      }
    }
    
    if (statusPageData && statusPageData.heartbeatList && Object.keys(statusPageData.heartbeatList).length > 0) {
      
      domain.hasStatusPage = true;
      
      // Add uptimeList to domain
      if (statusPageData.uptimeList) {
        domain.uptimeList = statusPageData.uptimeList;
      }
      
      // Update URLs with status page data
      domain.urls.forEach(url => {
        url.hasStatusPage = true;
        
        // Add uptimeList to each URL as well
        if (statusPageData.uptimeList) {
          url.uptimeList = statusPageData.uptimeList;
        }
        
        // Get heartbeats from all available monitors - each heartbeat should be a separate candle
        const allHeartbeats: StatusPageHeartbeat[] = [];
        
        // Extract all individual heartbeats from all monitors
        Object.entries(statusPageData.heartbeatList).forEach(([monitorId, heartbeatArray]) => {
          if (Array.isArray(heartbeatArray)) {
            // Each heartbeat in the array should be a separate candle
            heartbeatArray.forEach(heartbeat => {
              if (heartbeat && typeof heartbeat === 'object' && 'status' in heartbeat) {
                allHeartbeats.push(heartbeat as StatusPageHeartbeat);
              }
            });
          }
        });
        
        // Sort by time (newest first) and assign to URL
        url.heartbeats = allHeartbeats.sort((a, b) => 
          new Date(b.time).getTime() - new Date(a.time).getTime()
        );
      });
      
      domainsWithStatusPages.push(domain);
    }
  }

  // Calculate overall domain uptime for domains with status pages
  domainsWithStatusPages.forEach((domain) => {
    if (domain.urls.length > 0) {
      domain.avg_uptime_percentage = domain.urls.reduce((sum, url) => sum + url.avg_uptime_percentage, 0) / domain.urls.length;
    }
  });

  // Sort domains by name (displayName) by default
  domainsWithStatusPages.sort((a, b) => {
    const nameA = (a.displayName || a.domain).toLowerCase();
    const nameB = (b.displayName || b.domain).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return domainsWithStatusPages;
}


