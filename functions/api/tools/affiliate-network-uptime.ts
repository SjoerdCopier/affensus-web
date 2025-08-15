export interface Env {
  UPTIME_KUMA_SECRET: string;
  UPTIME_KUMA_URL?: string;
}

interface UptimeKumaMonitor {
  id: number;
  name: string;
  url: string;
  type: string;
  active: boolean;
  uptime?: number;
  avg_ping?: number;
}

interface UptimeKumaHeartbeat {
  id: number;
  monitor_id: number;
  status: number;
  msg: string;
  time: string;
  ping?: number;
  important: boolean;
  duration: number;
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

interface DayUptime {
  date: string;
  uptime: number | null;
}

interface UrlData {
  type: string;
  avg_uptime_percentage: number;
  avg_response_time: number;
  hasStatusPage: boolean;
  heartbeats?: StatusPageHeartbeat[];
  uptimeList?: { [key: string]: number };
}

interface UptimeData {
  type: string;
  day_uptime: DayUptime[];
}

interface Domain {
  domain: string;
  avg_uptime_percentage: number;
  urls: UrlData[];
  day_uptime: UptimeData[];
  hasStatusPage: boolean;
  uptimeList?: { [key: string]: number };
}

export async function onRequestGet(context: { env: Env, request: Request }): Promise<Response> {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const debug = url.searchParams.get('debug') === 'true';
    const test = url.searchParams.get('test') === 'true';
    
    const uptimeKumaSecret = env.UPTIME_KUMA_SECRET;

    if (!uptimeKumaSecret) {
      return new Response(JSON.stringify({ error: 'Uptime Kuma secret not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (test) {
      // Test the status page fetching for a specific network
      const testNetwork = 'daisycon';
      console.log(`Testing status page for ${testNetwork}`);
      const testData = await fetchStatusPageData(testNetwork, env.UPTIME_KUMA_URL);
      return new Response(JSON.stringify({ 
        message: 'Test mode enabled',
        testNetwork,
        statusPageData: testData,
        heartbeatCount: testData?.heartbeatList ? Object.values(testData.heartbeatList).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0) : 0
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (debug) {
      return new Response(JSON.stringify({ 
        message: 'Debug mode enabled',
        secret_configured: !!uptimeKumaSecret,
        secret_length: uptimeKumaSecret.length,
        endpoints_to_try: [
          `${env.UPTIME_KUMA_URL || 'http://152.42.135.243:3001'}/metrics`
        ]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Try multiple endpoints to get data from Uptime Kuma
    let metricsText = '';
    let success = false;

    // First try the metrics endpoint with Basic Auth
    try {
      const monitorsResponse = await fetch(`${env.UPTIME_KUMA_URL || 'http://152.42.135.243:3001'}/metrics`, {
        headers: {
          'Authorization': `Basic ${btoa(':' + uptimeKumaSecret)}`,
          'Accept': 'text/plain'
        }
      });

      if (monitorsResponse.ok) {
        metricsText = await monitorsResponse.text();
        console.log('Metrics response preview:', metricsText.substring(0, 200));
        
        // Check if we got HTML instead of metrics
        if (metricsText.startsWith('<!DOCTYPE') || metricsText.includes('<html')) {
          console.log('Received HTML instead of metrics, trying alternative approach');
        } else {
          success = true;
        }
      } else {
        console.error('Metrics endpoint failed:', monitorsResponse.status, monitorsResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }

    if (!success) {
      console.log('All API attempts failed - providing fallback response');
      
      // Check if we're in Cloudflare environment and the issue is network access
      const isCloudflareEnv = typeof caches !== 'undefined';
      const usingPrivateIp = !env.UPTIME_KUMA_URL && isCloudflareEnv;
      
      let errorMessage = 'Unable to fetch data from Uptime Kuma';
      if (usingPrivateIp) {
        errorMessage += ' - Private IP access blocked in production. Please configure UPTIME_KUMA_URL environment variable with a public domain.';
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
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Process the Prometheus metrics to match our expected format
    const processedDomains = await processPrometheusMetrics(metricsText, env.UPTIME_KUMA_URL);

    return new Response(JSON.stringify(processedDomains), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
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
        'Access-Control-Allow-Headers': 'Content-Type'
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

async function fetchStatusPageData(networkName: string, uptimeKumaUrl?: string): Promise<StatusPageResponse | null> {
  try {
    const url = `${uptimeKumaUrl || 'http://152.42.135.243:3001'}/api/status-page/heartbeat/${networkName}?limit=10080`;
    console.log(`Fetching status page from: ${url}`);
    
    const response = await fetch(url);
    
    console.log(`Status page response for ${networkName}:`, response.status, response.statusText);
    
    if (!response.ok) {
      console.log(`Status page not found for ${networkName}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Status page data for ${networkName}:`, {
      hasHeartbeatList: !!data.heartbeatList,
      heartbeatKeys: data.heartbeatList ? Object.keys(data.heartbeatList) : [],
      totalHeartbeats: data.heartbeatList ? Object.values(data.heartbeatList).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0) : 0
    });
    
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
        metrics: {}
      });
    }

    const monitor = monitors.get(monitorName)!;
    monitor.metrics[metricName] = parseFloat(value);
  }

  // Process monitors into domains
  for (const monitor of monitors.values()) {
    const domain = extractDomainFromMonitor(monitor.name);
    
    if (!domains.has(domain)) {
      domains.set(domain, {
        domain,
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
    const networkName = domain.domain;
    console.log(`Checking status page for network: ${networkName}`);
    
    const statusPageData = await fetchStatusPageData(networkName, uptimeKumaUrl);
    
    if (statusPageData && statusPageData.heartbeatList && Object.keys(statusPageData.heartbeatList).length > 0) {
      console.log(`Status page found for ${networkName}, heartbeats:`, Object.keys(statusPageData.heartbeatList).length);
      
      domain.hasStatusPage = true;
      
      // Add uptimeList to domain
      if (statusPageData.uptimeList) {
        domain.uptimeList = statusPageData.uptimeList;
        console.log(`Added uptimeList to domain ${domain.domain}:`, statusPageData.uptimeList);
      }
      
      // Update URLs with status page data
      domain.urls.forEach(url => {
        url.hasStatusPage = true;
        
        // Add uptimeList to each URL as well
        if (statusPageData.uptimeList) {
          url.uptimeList = statusPageData.uptimeList;
          console.log(`Added uptimeList to URL ${url.type}:`, statusPageData.uptimeList);
        }
        
        // Get heartbeats from all available monitors - each heartbeat should be a separate candle
        const allHeartbeats: StatusPageHeartbeat[] = [];
        console.log(`Processing heartbeats for ${domain.domain}, heartbeatList keys:`, Object.keys(statusPageData.heartbeatList));
        
        // Extract all individual heartbeats from all monitors
        Object.entries(statusPageData.heartbeatList).forEach(([monitorId, heartbeatArray]) => {
          console.log(`Monitor ${monitorId} heartbeats:`, Array.isArray(heartbeatArray) ? heartbeatArray.length : 'not array');
          if (Array.isArray(heartbeatArray)) {
            // Each heartbeat in the array should be a separate candle
            heartbeatArray.forEach(heartbeat => {
              if (heartbeat && typeof heartbeat === 'object' && 'status' in heartbeat) {
                allHeartbeats.push(heartbeat as StatusPageHeartbeat);
              }
            });
          }
        });
        
        console.log(`Total individual heartbeats collected for ${domain.domain}:`, allHeartbeats.length);
        
        // Sort by time (newest first) and assign to URL
        url.heartbeats = allHeartbeats.sort((a, b) => 
          new Date(b.time).getTime() - new Date(a.time).getTime()
        );
        
        console.log(`Final heartbeats assigned to ${domain.domain} ${url.type}:`, url.heartbeats.length);
        if (url.heartbeats.length > 0) {
          console.log(`Sample heartbeats:`, url.heartbeats.slice(0, 3));
        }
      });
      
      domainsWithStatusPages.push(domain);
    } else {
      console.log(`No status page found for ${networkName}`);
    }
  }

  console.log(`Total domains with status pages: ${domainsWithStatusPages.length}`);

  // Calculate overall domain uptime for domains with status pages
  domainsWithStatusPages.forEach((domain) => {
    if (domain.urls.length > 0) {
      domain.avg_uptime_percentage = domain.urls.reduce((sum, url) => sum + url.avg_uptime_percentage, 0) / domain.urls.length;
    }
  });

  return domainsWithStatusPages;
}

function extractDomainFromMonitor(monitorName: string): string {
  // Try to extract domain from monitor name
  // Expected format: "NetworkName - Homepage" or "NetworkName - API" etc.
  const parts = monitorName.split(' - ');
  if (parts.length > 0) {
    // Clean up the network name and make it lowercase
    let networkName = parts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Handle common variations
    if (networkName === 'daisycon') return 'daisycon';
    if (networkName === 'awin') return 'awin';
    if (networkName === 'cj') return 'cj';
    if (networkName === 'rakuten') return 'rakuten';
    if (networkName === 'impact') return 'impact';
    if (networkName === 'skimlinks') return 'skimlinks';
    if (networkName === 'shareasale') return 'shareasale';
    if (networkName === 'tradedoubler') return 'tradedoubler';
    if (networkName === 'webgains') return 'webgains';
    if (networkName === 'yieldkit') return 'yieldkit';
    if (networkName === 'admitad') return 'admitad';
    if (networkName === 'adtraction') return 'adtraction';
    if (networkName === 'affilae') return 'affilae';
    if (networkName === 'belboon') return 'belboon';
    if (networkName === 'brandreward') return 'brandreward';
    if (networkName === 'chinesean') return 'chinesean';
    if (networkName === 'circlewise') return 'circlewise';
    if (networkName === 'commissionfactory') return 'commissionfactory';
    if (networkName === 'cuelinks') return 'cuelinks';
    if (networkName === 'digidip') return 'digidip';
    if (networkName === 'effiliation') return 'effiliation';
    if (networkName === 'flexoffers') return 'flexoffers';
    if (networkName === 'glopss') return 'glopss';
    if (networkName === 'indoleads') return 'indoleads';
    if (networkName === 'involveasia') return 'involveasia';
    if (networkName === 'kelkoo') return 'kelkoo';
    if (networkName === 'kwanko') return 'kwanko';
    if (networkName === 'linkbux') return 'linkbux';
    if (networkName === 'mcanism') return 'mcanism';
    if (networkName === 'optimise') return 'optimise';
    if (networkName === 'partnerads') return 'partner-ads';
    if (networkName === 'partnerboost') return 'partnerboost';
    if (networkName === 'partnerize') return 'partnerize';
    if (networkName === 'retailads') return 'retailads';
    if (networkName === 'salestring') return 'salestring';
    if (networkName === 'smartresponse') return 'smartresponse';
    if (networkName === 'sourceknowledge') return 'sourceknowledge';
    if (networkName === 'takeads') return 'takeads';
    if (networkName === 'timeone') return 'timeone';
    if (networkName === 'tradetracker') return 'tradetracker';
    if (networkName === 'yadore') return 'yadore';
    if (networkName === 'accesstrade') return 'accesstrade';
    if (networkName === 'addrevenue') return 'addrevenue';
    if (networkName === 'adrecord') return 'adrecord';
    if (networkName === 'adservice') return 'adservice';
    
    return networkName;
  }
  return monitorName.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractTypeFromMonitor(monitorName: string): string {
  // Extract type from monitor name
  const parts = monitorName.split(' - ');
  if (parts.length > 1) {
    return parts[1];
  }
  return 'Homepage';
}
