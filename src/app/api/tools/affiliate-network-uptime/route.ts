import { NextResponse } from 'next/server';

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

function generateSampleDayUptime(baseUptime: number): DayUptime[] {
  // Generate last 60 days with sample data based on current uptime
  const today = new Date();
  const last60Days = Array.from({ length: 60 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last60Days.map(date => {
    // Generate some realistic variation around the base uptime
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const dayUptime = Math.max(0, Math.min(1, baseUptime + variation));
    
    return {
      date,
      uptime: dayUptime
    };
  });
}

function generateMockData(): Domain[] {
  const mockNetworks = [
    { name: 'ShareASale', uptime: 99.95, responseTime: 120 },
    { name: 'Commission Junction', uptime: 99.8, responseTime: 95 },
    { name: 'ClickBank', uptime: 98.5, responseTime: 150 },
    { name: 'Amazon Associates', uptime: 99.99, responseTime: 85 },
    { name: 'Impact', uptime: 99.2, responseTime: 110 },
    { name: 'Rakuten Advertising', uptime: 97.8, responseTime: 200 }
  ];

  return mockNetworks.map(network => {
    const baseUptime = network.uptime / 100;
    return {
      domain: network.name.toLowerCase().replace(/\s+/g, ''),
      avg_uptime_percentage: network.uptime,
      urls: [
        {
          type: 'Homepage',
          avg_uptime_percentage: network.uptime,
          avg_response_time: network.responseTime
        },
        {
          type: 'API',
          avg_uptime_percentage: network.uptime - 0.1,
          avg_response_time: network.responseTime + 20
        },
        {
          type: 'Tracking',
          avg_uptime_percentage: network.uptime + 0.05,
          avg_response_time: network.responseTime - 10
        }
      ],
      day_uptime: [
        {
          type: 'Homepage',
          day_uptime: generateSampleDayUptime(baseUptime)
        },
        {
          type: 'API',
          day_uptime: generateSampleDayUptime(baseUptime - 0.001)
        },
        {
          type: 'Tracking',
          day_uptime: generateSampleDayUptime(baseUptime + 0.0005)
        }
      ]
    };
  });
}

export async function GET() {
  try {
    // For now, return mock data
    // Later this can be replaced with actual Uptime Kuma integration
    const mockData = generateMockData();
    
    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error in affiliate-network-uptime API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
