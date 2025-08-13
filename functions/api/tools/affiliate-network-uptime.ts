export interface Env {
  UPTIME_KUMA_SECRET: string;
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

interface DayUptime {
  date: string;
  uptime: number | null;
}

interface UrlData {
  type: string;
  avg_uptime_percentage: number;
  avg_response_time: number;
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

    if (debug) {
      return new Response(JSON.stringify({ 
        message: 'Debug mode enabled',
        secret_configured: !!uptimeKumaSecret,
        secret_length: uptimeKumaSecret.length,
        endpoints_to_try: [
          'http://152.42.135.243:3001/metrics',
          'http://152.42.135.243:3001/api/status-page/affensus'
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
      const monitorsResponse = await fetch(`http://152.42.135.243:3001/metrics`, {
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

    // If metrics failed, try the status page API
    if (!success) {
      try {
        const statusResponse = await fetch(`http://152.42.135.243:3001/api/status-page/affensus`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('Status page data:', statusData);
          return new Response(JSON.stringify(processStatusPageData(statusData)), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type'
            }
          });
        }
      } catch (error) {
        console.error('Error fetching status page:', error);
      }
    }

    if (!success) {
      console.log('All API attempts failed');
      return new Response(JSON.stringify({ error: 'Unable to fetch data from Uptime Kuma - no real data available' }), {
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
    const processedDomains = await processPrometheusMetrics(metricsText);

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

async function processStatusPageData(statusData: any): Promise<Domain[]> {
  console.log('Processing status page data:', statusData);
  
  // If we can't process the status page data, return empty array
  if (!statusData || !statusData.publicGroupList) {
    return [];
  }

  const domains: Map<string, Domain> = new Map();

  // Process public groups and monitors
  statusData.publicGroupList.forEach((group: any) => {
    if (group.monitorList) {
      group.monitorList.forEach((monitor: any) => {
        const domain = extractDomainFromMonitor(monitor.name || 'unknown');
        const monitorType = extractTypeFromMonitor(monitor.name || 'unknown');

        if (!domains.has(domain)) {
          domains.set(domain, {
            domain,
            avg_uptime_percentage: 0,
            urls: [],
            day_uptime: []
          });
        }

        const domainData = domains.get(domain)!;
        
        // Calculate uptime from monitor data
        const uptime = monitor.uptime || 0;
        const responseTime = monitor.avgPing || 0;
        
        // Convert uptime to percentage if it's a decimal (0-1), otherwise assume it's already a percentage
        const uptimePercentage = uptime <= 1 ? uptime * 100 : uptime;
        const uptimeDecimal = uptime <= 1 ? uptime : uptime / 100;

        domainData.urls.push({
          type: monitorType,
          avg_uptime_percentage: uptimePercentage,
          avg_response_time: responseTime
        });

        // Only include today's data since we don't have historical data
        const today = new Date().toISOString().split('T')[0];
        domainData.day_uptime.push({
          type: monitorType,
          day_uptime: [{
            date: today,
            uptime: uptimeDecimal
          }]
        });
      });
    }
  });

  // Calculate overall domain uptime
  domains.forEach((domain) => {
    if (domain.urls.length > 0) {
      domain.avg_uptime_percentage = domain.urls.reduce((sum, url) => sum + url.avg_uptime_percentage, 0) / domain.urls.length;
    }
  });

  return Array.from(domains.values());
}

async function processPrometheusMetrics(metricsText: string): Promise<Domain[]> {
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
        day_uptime: []
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
      avg_response_time: responseTime
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

  // Calculate overall domain uptime
  domains.forEach((domain) => {
    if (domain.urls.length > 0) {
      domain.avg_uptime_percentage = domain.urls.reduce((sum, url) => sum + url.avg_uptime_percentage, 0) / domain.urls.length;
    }
  });

  return Array.from(domains.values());
}

function extractDomainFromMonitor(monitorName: string): string {
  // Try to extract domain from monitor name
  // Expected format: "NetworkName - Homepage" or "NetworkName - API" etc.
  const parts = monitorName.split(' - ');
  if (parts.length > 0) {
    return parts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
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

// Note: generateSampleDayUptime function removed since we only show real data from today

// Mock data generation removed - only real data from Uptime Kuma is used
