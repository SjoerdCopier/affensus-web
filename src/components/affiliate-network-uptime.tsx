"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Breadcrumbs from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useLocaleTranslations } from '@/hooks/use-locale-translations';
import Head from 'next/head';

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
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Day {day}</h4>
          <p>Uptime: {(uptime * 100).toFixed(3)}%</p>
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

const HeartbeatBar = ({ heartbeats }: { heartbeats: StatusPageHeartbeat[] }) => {
  console.log('HeartbeatBar received heartbeats:', heartbeats?.length, heartbeats);
  
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
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{heartbeat.time}</h4>
          <p>Status: {heartbeat.status === 1 ? 'UP' : 'DOWN'}</p>
          <p>Ping: {heartbeat.ping}ms</p>
          {heartbeat.msg && <p>Message: {heartbeat.msg}</p>}
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  // Show last 7 days of heartbeats (approximately 2016 heartbeats at 5-minute intervals)
  const recentHeartbeats = heartbeats
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 2016);

  console.log('Recent heartbeats to render:', recentHeartbeats.length);

  return (
    <div className="flex">
      {recentHeartbeats.map((heartbeat, index) => renderHeartbeatBar(heartbeat, index))}
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
  const { t, currentLocale } = useLocaleTranslations();
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
        console.log('API response data:', data);
        console.log('First domain data:', data[0]);
        console.log('First domain uptimeList:', data[0]?.uptimeList);
        console.log('First domain URLs:', data[0]?.urls);
        
        if (data[0]?.urls) {
          data[0].urls.forEach((url: UrlData, index: number) => {
            console.log(`URL ${index} full data:`, url);
            console.log(`URL ${index} uptimeList:`, url.uptimeList);
            console.log(`URL ${index} avg_uptime_percentage:`, url.avg_uptime_percentage);
            if (url.heartbeats) {
              console.log(`URL ${index} heartbeats:`, url.heartbeats.length, url.heartbeats.slice(0, 3));
            }
          });
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

  const calculateUptimeFromList = (uptimeList?: UptimeList, fallbackPercentage?: number): number => {
    console.log('calculateUptimeFromList called with:', uptimeList, 'fallback:', fallbackPercentage);
    
    if (!uptimeList || Object.keys(uptimeList).length === 0) {
      console.log('No uptimeList data, using fallback:', fallbackPercentage);
      // If no uptimeList, use fallback percentage (convert from percentage to decimal)
      return fallbackPercentage ? fallbackPercentage / 100 : 0;
    }
    
    const uptimeValues = Object.values(uptimeList);
    console.log('Uptime values:', uptimeValues);
    
    const totalUptime = uptimeValues.reduce((sum, uptime) => sum + uptime, 0);
    const averageUptime = totalUptime / uptimeValues.length;
    
    console.log('Total uptime:', totalUptime, 'Average uptime:', averageUptime);
    return averageUptime;
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

  const getCombinedUptimeData = (uptimeListArray: UptimeList[]) => {
    const combinedData = new Map<string, number>();
    
    // For each date, find the minimum uptime across all types (worst case scenario)
    uptimeListArray.forEach(uptimeList => {
      Object.entries(uptimeList).forEach(([day, uptime]) => {
        if (uptime !== null) {
          const currentMin = combinedData.get(day);
          if (currentMin === undefined || uptime < currentMin) {
            combinedData.set(day, uptime);
          }
        }
      });
    });
    
    // Convert to array and sort by date
    return Array.from(combinedData, ([date, uptime]) => ({ date, uptime }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-60); // Take last 60 days
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
              Get notified of any outages via email. <a href="#about" className="text-black underline">{t('tools.affiliateNetworkUptime.learnMore')}</a>
            </p>
            
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
                <option value="down">{t('tools.affiliateNetworkUptime.sortOptions.down')}</option>
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
                          <button onClick={() => toggleDomain(domain.domain)}>
                            {expandedDomain === domain.domain ? <ChevronUp /> : <ChevronDown />}
                          </button>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-4 text-left">
                            {capitalizeNetworkName(domain.domain)}
                          </div>
                          <div className="mb-4">
                            <h3 className="text-lg text-left font-semibold">{t('tools.affiliateNetworkUptime.status.combinedUptime')}</h3>
                            {domain.hasStatusPage && domain.urls.some(url => url.heartbeats) ? (
                              <div className="mb-2">
                                <h4 className="text-sm font-medium text-gray-600 mb-2">{t('tools.affiliateNetworkUptime.status.realTimeHeartbeats')}</h4>
                                {(() => { 
                                  const totalHeartbeats = domain.urls.reduce((sum, url) => sum + (url.heartbeats?.length || 0), 0);
                                  console.log(`Main view heartbeats for ${domain.domain}:`, totalHeartbeats);
                                  return null; 
                                })()}
                                <HeartbeatBar heartbeats={domain.urls.find(url => url.heartbeats)?.heartbeats || []} />
                              </div>
                            ) : (
                              <UptimeBar uptimeList={domain.uptimeList} />
                            )}
                            <p className="text-left pt-3">{t('tools.affiliateNetworkUptime.status.averageResponseTime')}: {calculateAverageResponseTime(domain.urls).toFixed(2)} ms</p>
                          </div>
                          {expandedDomain === domain.domain && (
                            domain.urls.map((urlData) => (
                              <div key={urlData.type} className="mb-4 text-left">
                                <h3 className="text-lg font-semibold">{urlData.type}</h3>
                                {urlData.hasStatusPage && urlData.heartbeats ? (
                                  <>
                                    <div className="mb-2">
                                      <h4 className="text-sm font-medium text-gray-600">{t('tools.affiliateNetworkUptime.status.realTimeHeartbeats')}</h4>
                                      {(() => { console.log(`Rendering heartbeats for ${domain.domain} ${urlData.type}:`, urlData.heartbeats?.length); return null; })()}
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
                            {getUptimeValue(domain.uptimeList) > 0.999 ? t('tools.affiliateNetworkUptime.status.allSystemsOperational') : t('tools.affiliateNetworkUptime.status.someSystemsDegraded')}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {getUptimeDisplay(domain.uptimeList)} {t('tools.affiliateNetworkUptime.status.uptime')}
                          </div>
                          <button onClick={() => toggleDomain(domain.domain)}>
                            {expandedDomain === domain.domain ? <ChevronUp /> : <ChevronDown />}
                          </button>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-4 text-left">
                            {capitalizeNetworkName(domain.domain)}
                          </div>
                          <div className="mb-4">
                            <h3 className="text-lg text-left font-semibold">{t('tools.affiliateNetworkUptime.status.combinedUptime')}</h3>
                            {domain.hasStatusPage && domain.urls.some(url => url.heartbeats) ? (
                              <div className="mb-2">
                                <h4 className="text-sm font-medium text-gray-600 mb-2">{t('tools.affiliateNetworkUptime.status.realTimeHeartbeats')}</h4>
                                {(() => { 
                                  const totalHeartbeats = domain.urls.reduce((sum, url) => sum + (url.heartbeats?.length || 0), 0);
                                  console.log(`Main view heartbeats:`, totalHeartbeats);
                                  return null; 
                                })()}
                                <HeartbeatBar heartbeats={domain.urls.find(url => url.heartbeats)?.heartbeats || []} />
                              </div>
                            ) : (
                              <UptimeBar uptimeList={domain.uptimeList} />
                            )}
                            <p className="text-left pt-3">{t('tools.affiliateNetworkUptime.status.averageResponseTime')}: {calculateAverageResponseTime(domain.urls).toFixed(2)} ms</p>
                          </div>
                          {expandedDomain === domain.domain && (
                            domain.urls.map((urlData) => (
                              <div key={urlData.type} className="mb-4 text-left">
                                <h3 className="text-lg font-semibold">{urlData.type}</h3>
                                {urlData.hasStatusPage && urlData.heartbeats ? (
                                  <>
                                    <div className="mb-2">
                                      <h4 className="text-sm font-medium text-gray-600">{t('tools.affiliateNetworkUptime.status.realTimeHeartbeats')}</h4>
                                      {(() => { console.log(`Rendering heartbeats for ${domain.domain} ${urlData.type}:`, urlData.heartbeats?.length); return null; })()}
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
              {t('tools.affiliateNetworkUptime.about.title')}
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#6ca979] sm:text-2xl">
              {t('tools.affiliateNetworkUptime.about.whatDoesItTrack.title')}
            </h2>
            <p>
              {t('tools.affiliateNetworkUptime.about.whatDoesItTrack.description')}
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#6ca979] pt-5 sm:text-2xl">
              {t('tools.affiliateNetworkUptime.about.coloredBars.title')}
            </h2>
            <p>
              {t('tools.affiliateNetworkUptime.about.coloredBars.description')}
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#6ca979] pt-5 sm:text-2xl">
              {t('tools.affiliateNetworkUptime.about.fiveNines.title')}
            </h2>
            <p>
              {t('tools.affiliateNetworkUptime.about.fiveNines.description')}
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#6ca979] pt-5 sm:text-2xl">
              {t('tools.affiliateNetworkUptime.about.checkFrequency.title')}
            </h2>
            <p>
              {t('tools.affiliateNetworkUptime.about.checkFrequency.description')}
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#6ca979] pt-5 sm:text-2xl">
              {t('tools.affiliateNetworkUptime.about.downtimeActions.title')}
            </h2>
            <p>
              {t('tools.affiliateNetworkUptime.about.downtimeActions.description')}
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
