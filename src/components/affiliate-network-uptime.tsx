"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Breadcrumbs from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Header from '@/components/header';
import Footer from '@/components/footer';



// HoverCard components for uptime details
const HoverCard = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const childrenArray = React.Children.toArray(children);
  const trigger = childrenArray.find((child) => 
    React.isValidElement(child) && child.type === HoverCardTrigger
  );
  const content = childrenArray.find((child) => 
    React.isValidElement(child) && child.type === HoverCardContent
  );
  
  return (
    <div className="relative inline-block" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      {trigger}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          {content}
        </div>
      )}
    </div>
  );
};

const HoverCardTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const HoverCardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap">
    {children}
  </div>
);

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

const UptimeBar = ({ dayUptime }: { dayUptime: DayUptime[] }) => {
  const renderBar = (date: string, uptime: number | null) => (
    <HoverCard key={date}>
      <HoverCardTrigger>
        <div 
          className={`w-1 h-4 mr-0.5 rounded cursor-pointer ${
            uptime === null ? 'bg-green-500' : 
            uptime === 1 ? 'bg-green-500' : 
            uptime >= 0.97 ? 'bg-orange-500' : 'bg-red-500'
          }`}
        ></div>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{date}</h4>
          <p>Uptime: {uptime !== null ? `${(uptime * 100).toFixed(2)}%` : 'N/A'}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  const generateLast60Days = () => {
    // Use the provided dayUptime data directly
    return dayUptime
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-60); // Take last 60 days
  };

  const last60DaysData = generateLast60Days();

  return (
    <div className="flex">
      {last60DaysData.map(({ date, uptime }) => renderBar(date, uptime))}
    </div>
  );
};

const SkeletonCard = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-[140px]" />
      <Skeleton className="h-4 w-[100px]" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-6 w-[200px] mb-4" />
      <Skeleton className="h-4 w-full mb-4" />
      <Skeleton className="h-4 w-[150px]" />
    </CardContent>
  </Card>
);

function AffiliateNetworkUptimeContent() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDomainData = async () => {
      setIsLoading(true);
      try {
        // Use relative path to API route (works with wrangler dev on any port)
        const response = await fetch('/api/tools/affiliate-network-uptime', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch domain data: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Check if the response contains an error
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (!data || data.length === 0) {
          console.warn('No data returned from API');
        }
        setDomains(data);
      } catch (err: unknown) {
        console.error('Error in fetchDomainData:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomainData();
  }, []);

  const toggleDomain = (domainName: string) => {
    setExpandedDomain(expandedDomain === domainName ? null : domainName);
  };

  const sortDomains = useCallback((option: string) => {
    if (domains.length === 0) return; // Don't sort empty array
    
    const sortedDomains = [...domains];
    switch (option) {
      case 'uptime':
        sortedDomains.sort((a, b) => b.avg_uptime_percentage - a.avg_uptime_percentage);
        break;
      case 'down':
        sortedDomains.sort((a, b) => (a.avg_uptime_percentage < 100 ? -1 : 1) - (b.avg_uptime_percentage < 100 ? -1 : 1));
        break;
      case 'highest-downtime':
        sortedDomains.sort((a, b) => (100 - a.avg_uptime_percentage) - (100 - b.avg_uptime_percentage));
        break;
      default:
        // Keep original order
        return;
    }
    setDomains(sortedDomains);
  }, [domains]);

  useEffect(() => {
    sortDomains(sortOption);
  }, [sortOption, sortDomains]);

  const filteredDomains = domains.filter(domain =>
    domain.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAverageResponseTime = (urls: UrlData[]) => {
    const totalResponseTime = urls.reduce((sum, url) => sum + url.avg_response_time, 0);
    return urls.length > 0 ? totalResponseTime / urls.length : 0;
  };

  const getCombinedUptimeData = (dayUptimeArray: UptimeData[]) => {
    const combinedData = new Map<string, number>();
    
    // For each date, find the minimum uptime across all types (worst case scenario)
    dayUptimeArray.forEach(type => {
      type.day_uptime.forEach(day => {
        if (day.uptime !== null) {
          const currentMin = combinedData.get(day.date);
          if (currentMin === undefined || day.uptime < currentMin) {
            combinedData.set(day.date, day.uptime);
          }
        }
      });
    });
    
    // Convert to array and sort by date
    return Array.from(combinedData, ([date, uptime]) => ({ date, uptime }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-60); // Take last 60 days
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Header />
      </div>
      
      <main className="container mx-auto px-4 pt-4 pb-16 space-y-12">
        {/* Breadcrumbs */}
        <div>
          <Breadcrumbs
            items={[
              {
                label: "Tools",
                href: "/tools",
              },
              {
                label: "Affiliate Network Uptime",
                href: "/tools/affiliate-network-uptime",
                current: true,
              },
            ]}
          />
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-800">
              Network <span className="underline decoration-[#6ca979]">Uptime</span> Reporting
            </h1>
            <p className="max-w-5xl mx-auto text-sm opacity-90 leading-relaxed mb-6 text-black">
              We monitor affiliate networks every 5 minutes, ensuring the homepage, API, and key tracking links are operational.
              <br />
              Get notified of any outages via email. <a href="#about" className="text-black underline">Learn more about this tool</a>
            </p>
            
            <div className="mb-6 flex justify-between items-center">
              <Input
                type="text"
                placeholder="Search Networks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="w-[180px] px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="default">Default</option>
                <option value="uptime">Highest Uptime</option>
                <option value="down">Currently Down</option>
                <option value="highest-downtime">Highest Downtime</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : error ? (
                <div className="col-span-2 text-red-500">{error}</div>
              ) : filteredDomains.length === 0 ? (
                <div className="col-span-2 text-center text-gray-500">
                  <p>No uptime data available at the moment.</p>
                  <p className="text-sm mt-2">Uptime monitoring is being configured and will be available soon.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-8">
                    {filteredDomains.filter((_, index) => index % 2 === 0).map((domain) => (
                      <Card key={domain.domain}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {domain.avg_uptime_percentage > 99.9 ? 'All Systems Operational' : 'Some Systems Degraded'}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {domain.avg_uptime_percentage.toFixed(3)}% Uptime
                          </div>
                          <button onClick={() => toggleDomain(domain.domain)}>
                            {expandedDomain === domain.domain ? <ChevronUp /> : <ChevronDown />}
                          </button>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-4 text-left">
                            {domain.domain}
                          </div>
                          <div className="mb-4">
                            <h3 className="text-lg text-left font-semibold">Combined Uptime</h3>
                            <UptimeBar dayUptime={getCombinedUptimeData(domain.day_uptime)} />
                            <p className="text-left pt-3">Average Response Time: {calculateAverageResponseTime(domain.urls).toFixed(2)} ms</p>
                          </div>
                          {expandedDomain === domain.domain && (
                            domain.day_uptime.map((uptimeData) => {
                              const urlData = domain.urls.find(url => url.type === uptimeData.type);
                              return (
                                <div key={uptimeData.type} className="mb-4 text-left">
                                  <h3 className="text-lg font-semibold">{uptimeData.type}</h3>
                                  <UptimeBar dayUptime={uptimeData.day_uptime} />
                                  {urlData && (
                                    <>
                                      <p>Uptime: {(urlData.avg_uptime_percentage).toFixed(3)}%</p>
                                      <p>Avg Response Time: {urlData.avg_response_time.toFixed(2)} ms</p>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="space-y-8">
                    {filteredDomains.filter((_, index) => index % 2 !== 0).map((domain) => (
                      <Card key={domain.domain}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {domain.avg_uptime_percentage > 99.9 ? 'All Systems Operational' : 'Some Systems Degraded'}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {domain.avg_uptime_percentage.toFixed(3)}% Uptime
                          </div>
                          <button onClick={() => toggleDomain(domain.domain)}>
                            {expandedDomain === domain.domain ? <ChevronUp /> : <ChevronDown />}
                          </button>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-4 text-left">
                            {domain.domain}
                          </div>
                          <div className="mb-4">
                            <h3 className="text-lg text-left font-semibold">Combined Uptime</h3>
                            <UptimeBar dayUptime={getCombinedUptimeData(domain.day_uptime)} />
                            <p className="text-left pt-3">Average Response Time: {calculateAverageResponseTime(domain.urls).toFixed(2)} ms</p>
                          </div>
                          {expandedDomain === domain.domain && (
                            domain.day_uptime.map((uptimeData) => {
                              const urlData = domain.urls.find(url => url.type === uptimeData.type);
                              return (
                                <div key={uptimeData.type} className="mb-4 text-left">
                                  <h3 className="text-lg font-semibold">{uptimeData.type}</h3>
                                  <UptimeBar dayUptime={uptimeData.day_uptime} />
                                  {urlData && (
                                    <>
                                      <p>Uptime: {(urlData.avg_uptime_percentage).toFixed(3)}%</p>
                                      <p>Avg Response Time: {urlData.avg_response_time.toFixed(2)} ms</p>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-white px-6 pb-32 lg:px-8" id="about">
          <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
            <p className="text-base font-medium leading-7 text-[#6ca979]">
              Affiliate Network Uptime Monitor
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#6ca979] sm:text-2xl">
              What does our Uptime Monitor track?
            </h2>
            <p>
              Our Uptime Monitor will track three crucial components of affiliate networks: Homepage, API, and Tracking URLs. We will continuously check these elements to ensure your affiliate operations run smoothly once the system is fully implemented.
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#6ca979] pt-5 sm:text-2xl">
              What do the colored bars represent?
            </h2>
            <p>
              Green bars indicate optimal performance (99.9% uptime or higher), orange bars show potential issues (97-99.8% uptime), and red bars signal critical problems (below 97% uptime). These visual cues help you quickly assess the health of your affiliate networks.
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#6ca979] pt-5 sm:text-2xl">
              What does 99.999% uptime mean?
            </h2>
            <p>
              99.999% uptime, often called &ldquo;five nines,&rdquo; means the service is available 99.999% of the time. This translates to only 5.26 minutes of downtime per year, indicating exceptional reliability. For affiliate networks, this level of uptime is crucial to maximize earnings and maintain user trust.
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#6ca979] pt-5 sm:text-2xl">
              How often do we check for uptime?
            </h2>
            <p>
              Once fully implemented, we will perform checks every 5 minutes, providing near real-time monitoring of your affiliate network&apos;s performance. This frequent monitoring will allow for quick detection and response to any issues that may arise.
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#6ca979] pt-5 sm:text-2xl">
              What actions should I take if downtime is detected?
            </h2>
            <p>
              When the monitoring system is active and significant downtime is detected, we recommend: 1) Verifying the issue on your end, 2) Contacting the affiliate network&apos;s support team, 3) Temporarily pausing any active campaigns, and 4) Keeping your affiliates informed about the situation. Our system will also provide automated alerts to help you respond quickly to any disruptions.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function AffiliateNetworkUptime() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AffiliateNetworkUptimeContent />
    </Suspense>
  );
}
