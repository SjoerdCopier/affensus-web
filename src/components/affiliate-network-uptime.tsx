"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Breadcrumbs from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ChevronDown, ChevronUp } from 'lucide-react'; // Commented out - used for expand/collapse functionality
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useLocaleTranslations } from '@/hooks/use-locale-translations';
import Head from 'next/head';
import { Bell, Clock, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

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
  <div className="bg-black text-white px-3 py-2 rounded text-xs whitespace-nowrap">
    {children}
  </div>
);

interface StatusPageHeartbeat {
  status: number;
  time: string;
  msg: string;
  ping: number;
}

interface UptimeList {
  [key: string]: number; // e.g., "5": 0.9980276134122288
}

interface UrlData {
  type: string;
  avg_uptime_percentage: number;
  avg_response_time: number;
  hasStatusPage: boolean;
  heartbeats?: StatusPageHeartbeat[];
  uptimeList?: UptimeList;
}

interface Domain {
  domain: string;
  displayName?: string;
  avg_uptime_percentage: number;
  urls: UrlData[];
  uptimeList?: UptimeList;
  hasStatusPage: boolean;
}

const UptimeBar = ({ uptimeList }: { uptimeList?: UptimeList }) => {
  const renderBar = (day: string, uptime: number) => (
    <HoverCard key={day}>
      <HoverCardTrigger>
        <div 
          className={`w-1 h-4 mr-0.5 rounded cursor-pointer ${
            uptime >= 0.999 ? 'bg-green-500' : 
            uptime >= 0.97 ? 'bg-orange-500' : 'bg-red-500'
          }`}
        ></div>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-white">Day {day}</h4>
          <p className="text-xs text-gray-200">Uptime: {(uptime * 100).toFixed(3)}%</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  if (!uptimeList) {
    return <div className="text-gray-500 text-sm">No uptime data available</div>;
  }

  // Convert uptimeList to array and sort by day number
  const sortedUptime = Object.entries(uptimeList)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .slice(-60); // Take last 60 days

  return (
    <div className="flex">
      {sortedUptime.map(([day, uptime]) => renderBar(day, uptime))}
    </div>
  );
};

const HeartbeatBar = ({ heartbeats, showTimeRange = false }: { heartbeats: StatusPageHeartbeat[], showTimeRange?: boolean }) => {
  const renderHeartbeatBar = (heartbeat: StatusPageHeartbeat, index: number) => (
    <HoverCard key={index}>
      <HoverCardTrigger>
        <div 
          className={`w-1 h-4 mr-0.5 rounded cursor-pointer ${
            heartbeat.status === 1 ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-white">{heartbeat.time}</h4>
          <p className="text-xs text-gray-200">Status: {heartbeat.status === 1 ? 'UP' : 'DOWN'}</p>
          {heartbeat.msg && <p className="text-xs text-gray-300">Message: {heartbeat.msg}</p>}
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  // Show recent heartbeats (limit to prevent performance issues)
  const recentHeartbeats = heartbeats
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 2016);

  // Calculate the actual time range for these specific heartbeats
  const getTimeRange = (): string => {
    if (!recentHeartbeats || recentHeartbeats.length === 0) {
      return "No data";
    }
    
    if (recentHeartbeats.length === 1) {
      return "Single check";
    }
    
    const newest = new Date(recentHeartbeats[0].time);
    const oldest = new Date(recentHeartbeats[recentHeartbeats.length - 1].time);
    
    const diffInMs = newest.getTime() - oldest.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInDays >= 1) {
      return `Last ${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours >= 1) {
      return `Last ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `Last ${Math.max(1, diffInMinutes)} minute${diffInMinutes > 1 ? 's' : ''}`;
    }
  };

  return (
    <div>
      {showTimeRange && (
        <h4 className="text-sm font-medium text-gray-600 mb-2 text-left">
          Real-time Heartbeats ({getTimeRange()})
        </h4>
      )}
      <div className="flex">
        {recentHeartbeats.map((heartbeat, index) => renderHeartbeatBar(heartbeat, index))}
      </div>
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
  const { t } = useLocaleTranslations();
  const [domains, setDomains] = useState<Domain[]>([]);
  // const [expandedDomain, setExpandedDomain] = useState<string | null>(null); // Commented out - used for expand/collapse functionality
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDomainData = async () => {
      setIsLoading(true);
      try {
        // Use relative path to API route (works with wrangler dev on any port)
        // Add cache-busting to ensure fresh data

        const response = await fetch(`/api/tools/affiliate-network-uptime?t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          cache: 'no-store', // Next.js specific
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
        
        // Sort the data by name initially (backend should already do this, but ensure it's sorted)
        const sortedData = [...data].sort((a, b) => {
          const nameA = (a.displayName || a.domain).toLowerCase();
          const nameB = (b.displayName || b.domain).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        setDomains(sortedData);
      } catch (err: unknown) {
        console.error('Error in fetchDomainData:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomainData();
  }, []);

  // const toggleDomain = (domainName: string) => {
  //   setExpandedDomain(expandedDomain === domainName ? null : domainName);
  // }; // Commented out - used for expand/collapse functionality

  const getActualUptimeValue = (domain: Domain): number => {
    // Use uptimeList if available (more accurate), otherwise use avg_uptime_percentage
    if (domain.uptimeList && Object.keys(domain.uptimeList).length > 0) {
      return Object.values(domain.uptimeList)[0] * 100; // Convert to percentage
    }
    return domain.avg_uptime_percentage;
  };

  const sortDomains = useCallback((option: string) => {
    setDomains(prevDomains => {
      if (prevDomains.length === 0) return prevDomains;
      
      const sortedDomains = [...prevDomains];
      switch (option) {
        case 'uptime':
          sortedDomains.sort((a, b) => getActualUptimeValue(b) - getActualUptimeValue(a));
          break;
        case 'highest-downtime':
          sortedDomains.sort((a, b) => {
            const uptimeA = getActualUptimeValue(a);
            const uptimeB = getActualUptimeValue(b);
            // Sort by lowest uptime first (highest downtime)
            return uptimeA - uptimeB;
          });
          break;
        default:
          // Default: sort by name (displayName or domain)
          sortedDomains.sort((a, b) => {
            const nameA = (a.displayName || a.domain).toLowerCase();
            const nameB = (b.displayName || b.domain).toLowerCase();
            return nameA.localeCompare(nameB);
          });
          break;
      }
      
      return sortedDomains;
    });
  }, []);

  useEffect(() => {
    sortDomains(sortOption);
  }, [sortOption, sortDomains]);

  const filteredDomains = domains.filter(domain =>
    domain.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (domain.displayName && domain.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateAverageResponseTime = (urls: UrlData[]) => {
    const totalResponseTime = urls.reduce((sum, url) => sum + url.avg_response_time, 0);
    return urls.length > 0 ? totalResponseTime / urls.length : 0;
  };

  const getUptimeDisplay = (uptimeList?: UptimeList): string => {
    if (!uptimeList || Object.keys(uptimeList).length === 0) {
      return 'N/A';
    }
    
    // Get the first (and likely only) uptime value from the list
    const uptimeValue = Object.values(uptimeList)[0];
    return `${(uptimeValue * 100).toFixed(3)}%`;
  };

  const getUptimeValue = (uptimeList?: UptimeList): number => {
    if (!uptimeList || Object.keys(uptimeList).length === 0) {
      return 0;
    }
    
    // Get the first (and likely only) uptime value from the list
    return Object.values(uptimeList)[0];
  };



  const capitalizeNetworkName = (networkName: string): string => {
    // Simple dynamic capitalization that works for any network name
    return networkName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{t('metadata.tools.affiliateNetworkUptime.title')}</title>
        <meta name="description" content={t('metadata.tools.affiliateNetworkUptime.description')} />
      </Head>
      
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
              {t('tools.affiliateNetworkUptime.title')}
            </h1>
            <p className="max-w-5xl mx-auto text-sm opacity-90 leading-relaxed mb-6 text-black">
              {t('tools.affiliateNetworkUptime.description')}
              <br />
              {t('tools.affiliateNetworkUptime.emailNotifications')} <a href="#about" className="text-black underline">{t('tools.affiliateNetworkUptime.learnMore')}</a>
            </p>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 my-12">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-green-600">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">Real-time Alerts</h3>
                <p className="text-sm text-muted-foreground">Instant notifications the moment a link goes down</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-green-600">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">24/7 Monitoring</h3>
                <p className="text-sm text-muted-foreground">Continuous uptime monitoring around the clock</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-green-600">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">Get notified within seconds of any outage</p>
              </div>
            </div>

            {/* Login/Register Button */}
            <div className="mb-8">
              <Link href="/auth">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                  Login or Register for Alerts
                </Button>
              </Link>
            </div>

            
            
            <div className="mb-6 flex justify-between items-center">
              <Input
                type="text"
                placeholder={t('tools.affiliateNetworkUptime.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="w-[180px] px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="default">{t('tools.affiliateNetworkUptime.sortOptions.default')}</option>
                <option value="uptime">{t('tools.affiliateNetworkUptime.sortOptions.uptime')}</option>
                <option value="highest-downtime">{t('tools.affiliateNetworkUptime.sortOptions.highestDowntime')}</option>
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
                <div className="col-span-2 text-red-500">{t('tools.affiliateNetworkUptime.messages.error')}</div>
              ) : filteredDomains.length === 0 ? (
                <div className="col-span-2 text-center text-gray-500">
                  <p>{t('tools.affiliateNetworkUptime.messages.noDataAvailable')}</p>
                  <p className="text-sm mt-2">{t('tools.affiliateNetworkUptime.messages.configuring')}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-8">
                    {filteredDomains.filter((_, index) => index % 2 === 0).map((domain) => (
                      <Card key={domain.domain}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {getUptimeValue(domain.uptimeList) > 0.999 ? t('tools.affiliateNetworkUptime.status.allSystemsOperational') : t('tools.affiliateNetworkUptime.status.someSystemsDegraded')}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {getUptimeDisplay(domain.uptimeList)} {t('tools.affiliateNetworkUptime.status.uptime')}
                          </div>
                          {/* <button onClick={() => toggleDomain(domain.domain)}>
                            {expandedDomain === domain.domain ? <ChevronUp /> : <ChevronDown />}
                          </button> */}
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-4 text-left">
                            {domain.displayName || capitalizeNetworkName(domain.domain)}
                          </div>
                          <div className="mb-4">
                            {domain.hasStatusPage && domain.urls.some(url => url.heartbeats) ? (
                              <HeartbeatBar heartbeats={domain.urls.find(url => url.heartbeats)?.heartbeats || []} showTimeRange={true} />
                            ) : (
                              <UptimeBar uptimeList={domain.uptimeList} />
                            )}
                            <p className="text-left pt-3">{t('tools.affiliateNetworkUptime.status.averageResponseTime')}: {calculateAverageResponseTime(domain.urls).toFixed(2)} ms</p>
                          </div>
                          {/* {expandedDomain === domain.domain && (
                            domain.urls.map((urlData) => (
                              <div key={urlData.type} className="mb-4 text-left">
                                <h3 className="text-lg font-semibold">{urlData.type}</h3>
                                {urlData.hasStatusPage && urlData.heartbeats ? (
                                  <>
                                    <div className="mb-2">
                                      <h4 className="text-sm font-medium text-gray-600 text-left">{t('tools.affiliateNetworkUptime.status.realTimeHeartbeats')}</h4>

                                      <HeartbeatBar heartbeats={urlData.heartbeats} />
                                    </div>
                                    <p className="text-sm text-gray-600">{t('tools.affiliateNetworkUptime.status.uptimeLabel')}: {getUptimeDisplay(urlData.uptimeList)}</p>
                                    <p className="text-sm text-gray-600">{t('tools.affiliateNetworkUptime.status.avgResponseTime')}: {urlData.avg_response_time.toFixed(2)} ms</p>
                                  </>
                                ) : (
                                  <>
                                    <UptimeBar uptimeList={urlData.uptimeList} />
                                    <p>{t('tools.affiliateNetworkUptime.status.uptimeLabel')}: {getUptimeDisplay(urlData.uptimeList)}</p>
                                    <p>{t('tools.affiliateNetworkUptime.status.avgResponseTime')}: {urlData.avg_response_time.toFixed(2)} ms</p>
                                  </>
                                )}
                              </div>
                            ))
                          )} */}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="space-y-8">
                    {filteredDomains.filter((_, index) => index % 2 !== 0).map((domain) => (
                      <Card key={domain.domain}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {getUptimeValue(domain.uptimeList) > 0.999 ? t('tools.affiliateNetworkUptime.status.allSystemsOperational') : t('tools.affiliateNetworkUptime.status.someSystemsDegraded')}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {getUptimeDisplay(domain.uptimeList)} {t('tools.affiliateNetworkUptime.status.uptime')}
                          </div>
                          {/* <button onClick={() => toggleDomain(domain.domain)}>
                            {expandedDomain === domain.domain ? <ChevronUp /> : <ChevronDown />}
                          </button> */}
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-4 text-left">
                            {domain.displayName || capitalizeNetworkName(domain.domain)}
                          </div>
                          <div className="mb-4">
                            {domain.hasStatusPage && domain.urls.some(url => url.heartbeats) ? (
                              <HeartbeatBar heartbeats={domain.urls.find(url => url.heartbeats)?.heartbeats || []} showTimeRange={true} />
                            ) : (
                              <UptimeBar uptimeList={domain.uptimeList} />
                            )}
                            <p className="text-left pt-3">{t('tools.affiliateNetworkUptime.status.averageResponseTime')}: {calculateAverageResponseTime(domain.urls).toFixed(2)} ms</p>
                          </div>
                          {/* {expandedDomain === domain.domain && (
                            domain.urls.map((urlData) => (
                              <div key={urlData.type} className="mb-4 text-left">
                                <h3 className="text-lg font-semibold">{urlData.type}</h3>
                                {urlData.hasStatusPage && urlData.heartbeats ? (
                                  <>
                                    <div className="mb-2">
                                      <h4 className="text-sm font-medium text-gray-600">{t('tools.affiliateNetworkUptime.status.realTimeHeartbeats')}</h4>

                                      <HeartbeatBar heartbeats={urlData.heartbeats} />
                                    </div>
                                    <p className="text-sm text-gray-600">{t('tools.affiliateNetworkUptime.status.uptimeLabel')}: {getUptimeDisplay(urlData.uptimeList)}</p>
                                    <p className="text-sm text-gray-600">{t('tools.affiliateNetworkUptime.status.avgResponseTime')}: {urlData.avg_response_time.toFixed(2)} ms</p>
                                  </>
                                ) : (
                                  <>
                                    <UptimeBar uptimeList={urlData.uptimeList} />
                                    <p>{t('tools.affiliateNetworkUptime.status.uptimeLabel')}: {getUptimeDisplay(urlData.uptimeList)}</p>
                                    <p>{t('tools.affiliateNetworkUptime.status.avgResponseTime')}: {urlData.avg_response_time.toFixed(2)} ms</p>
                                  </>
                                )}
                              </div>
                            ))
                          )} */}
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
            <p className="text-base font-medium leading-7 text-black">
              {t('tools.affiliateNetworkUptime.about.title')}
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-black sm:text-2xl">
              {t('tools.affiliateNetworkUptime.about.whatDoesItTrack.title')}
            </h2>
            <p>
              {t('tools.affiliateNetworkUptime.about.whatDoesItTrack.description')}
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-black pt-5 sm:text-2xl">
              {t('tools.affiliateNetworkUptime.about.coloredBars.title')}
            </h2>
            <p>
              {t('tools.affiliateNetworkUptime.about.coloredBars.description')}
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-black pt-5 sm:text-2xl">
              {t('tools.affiliateNetworkUptime.about.fiveNines.title')}
            </h2>
            <p>
              {t('tools.affiliateNetworkUptime.about.fiveNines.description')}
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-black pt-5 sm:text-2xl">
              {t('tools.affiliateNetworkUptime.about.checkFrequency.title')}
            </h2>
            <p>
              {t('tools.affiliateNetworkUptime.about.checkFrequency.description')}
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-black pt-5 sm:text-2xl">
              {t('tools.affiliateNetworkUptime.about.downtimeActions.title')}
            </h2>
            <p>
              {t('tools.affiliateNetworkUptime.about.downtimeActions.description')}
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-black pt-5 sm:text-2xl">
              {t('tools.affiliateNetworkUptime.about.customNetworks.title')}
            </h2>
            <p>
              {t('tools.affiliateNetworkUptime.about.customNetworks.description')}
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
