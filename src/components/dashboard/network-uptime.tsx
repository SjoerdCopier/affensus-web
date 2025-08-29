"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Wifi, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard';
import { useUser } from '@/hooks/use-user';

// Interface definitions
interface StatusPageHeartbeat {
  status: number;
  time: string;
  msg: string;
  ping: number;
}

interface UptimeList {
  [key: string]: number;
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
  dashboardId?: string; // The monitor ID from Uptime Kuma
  avg_uptime_percentage: number;
  urls: UrlData[];
  uptimeList?: UptimeList;
  hasStatusPage: boolean;
}

interface SelectedNetwork {
  id?: number;
  domain: string;
  displayName?: string;
  dashboardId?: string; // The monitor ID from Uptime Kuma
  enabled: boolean;
  notification_enabled?: boolean;
  check_interval_minutes?: number;
}

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
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
          {content}
        </div>
      )}
    </div>
  );
};

const HoverCardTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const HoverCardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg border border-gray-700">
    {children}
  </div>
);

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

  const recentHeartbeats = heartbeats
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 480); // Show last 8 hours worth

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
        <h4 className="text-xs font-medium text-gray-600 mb-2 text-left">
          Heartbeats ({getTimeRange()})
        </h4>
      )}
      <div className="flex overflow-hidden">
        {recentHeartbeats.map((heartbeat, index) => renderHeartbeatBar(heartbeat, index))}
      </div>
    </div>
  );
};

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
    return <div className="text-gray-500 text-xs">No uptime data available</div>;
  }

  const sortedUptime = Object.entries(uptimeList)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .slice(-30); // Take last 30 days

  return (
    <div>
      <h4 className="text-xs font-medium text-gray-600 mb-2 text-left">
        Daily Uptime (Last 30 days)
      </h4>
      <div className="flex overflow-hidden">
        {sortedUptime.map(([day, uptime]) => renderBar(day, uptime))}
      </div>
    </div>
  );
};



interface DashboardNetworkUptimeProps {
  locale?: string;
}

export default function DashboardNetworkUptime({ }: DashboardNetworkUptimeProps) {
  const { user } = useUser();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<SelectedNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return; // Don't fetch if user is not authenticated
      
      setIsLoading(true);
      try {
        // Fetch domain data
        const domainResponse = await fetch('/api/tools/affiliate-network-uptime', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!domainResponse.ok) {
          throw new Error(`Failed to fetch domain data: ${domainResponse.statusText}`);
        }
        const domainData = await domainResponse.json();
        
        if (domainData.error) {
          throw new Error(domainData.error);
        }
        
        const sortedData = [...domainData].sort((a, b) => {
          const nameA = (a.displayName || a.domain).toLowerCase();
          const nameB = (b.displayName || b.domain).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        setDomains(sortedData);
        
        // Fetch user's saved monitors 
        const monitorsResponse = await fetch(`/api/network-monitors?userId=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        let savedMonitors: SelectedNetwork[] = [];
        if (monitorsResponse.ok) {
          const monitorsData = await monitorsResponse.json();
          if (monitorsData.success) {
            savedMonitors = monitorsData.data.map((monitor: Record<string, unknown>) => ({
              id: monitor.id as number,
              domain: monitor.domain as string,
              displayName: monitor.display_name as string,
              enabled: Boolean(monitor.enabled),
              notification_enabled: Boolean(monitor.notification_enabled),
              check_interval_minutes: monitor.check_interval_minutes as number
            }));
          }
        }
        
        // Merge domain data with saved monitors
        const initialSelection = sortedData.map(domain => {
          const savedMonitor = savedMonitors.find(m => m.domain === domain.domain);
          return {
            domain: domain.domain,
            displayName: domain.displayName,
            dashboardId: domain.dashboardId, // Store the dashboard ID from metrics
            enabled: savedMonitor?.enabled || false,
            id: savedMonitor?.id,
            notification_enabled: savedMonitor?.notification_enabled || true,
            check_interval_minutes: savedMonitor?.check_interval_minutes || 5
          };
        });
        setSelectedNetworks(initialSelection);
        
      } catch (err: unknown) {
        console.error('Error in fetchData:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const capitalizeNetworkName = (networkName: string): string => {
    return networkName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleNetworkToggle = async (domain: string, enabled: boolean) => {
    if (!user?.id) return; // Don't proceed if user is not authenticated
    
    const network = selectedNetworks.find(n => n.domain === domain);
    if (!network) return;

    // Store original state for potential rollback
    const originalState = { ...network };

    try {
      if (enabled && !network.id) {
        // Optimistic update: immediately show the network as enabled
        setSelectedNetworks(prev => 
          prev.map(n => 
            n.domain === domain 
              ? { ...n, enabled: true }
              : n
          )
        );

        // Create new monitor in background
        const response = await fetch('/api/network-monitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            domain: domain,
            dashboard_id: network.dashboardId, // Send the dashboard ID from Uptime Kuma
            display_name: network.displayName,
            enabled: true,
            notification_enabled: true,
            check_interval_minutes: 5
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Update local state with the new ID from server
            setSelectedNetworks(prev => 
              prev.map(n => 
                n.domain === domain 
                  ? { ...n, enabled: true, id: result.data.id }
                  : n
              )
            );
          } else {
            // Rollback optimistic update on failure
            setSelectedNetworks(prev => 
              prev.map(n => 
                n.domain === domain 
                  ? originalState
                  : n
              )
            );
            console.error('Failed to create monitor:', result.error);
          }
        } else {
          // Rollback optimistic update on HTTP error
          setSelectedNetworks(prev => 
            prev.map(n => 
              n.domain === domain 
                ? originalState
                : n
            )
          );
          console.error('HTTP error creating monitor:', response.status);
        }
      } else if (network.id) {
        // Optimistic update for existing monitors
        setSelectedNetworks(prev => 
          prev.map(n => 
            n.domain === domain 
              ? { ...n, enabled }
              : n
          )
        );

        // Update existing monitor in background
        const response = await fetch('/api/network-monitors', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: network.id,
            user_id: user.id,
            enabled: enabled
          }),
        });

        if (!response.ok) {
          // Rollback optimistic update on failure
          setSelectedNetworks(prev => 
            prev.map(n => 
              n.domain === domain 
                ? originalState
                : n
            )
          );
          console.error('HTTP error updating monitor:', response.status);
        }
      }
    } catch (error) {
      // Rollback optimistic update on network/parsing errors
      setSelectedNetworks(prev => 
        prev.map(n => 
          n.domain === domain 
            ? originalState
            : n
        )
      );
      console.error('Error updating network monitor:', error);
      // Could add toast notification here in the future
    }
  };

  const handleDeleteMonitor = async (domain: string) => {
    if (!user?.id) return; // Don't proceed if user is not authenticated
    
    const network = selectedNetworks.find(n => n.domain === domain);
    if (!network?.id) return; // Can't delete if no ID (not saved yet)

    try {
      const response = await fetch('/api/network-monitors', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: network.id,
          user_id: user.id
        }),
      });

      if (response.ok) {
        // Remove from local state
        setSelectedNetworks(prev => 
          prev.map(n => 
            n.domain === domain 
              ? { ...n, enabled: false, id: undefined }
              : n
          )
        );
      }
    } catch (error) {
      console.error('Error deleting network monitor:', error);
      // Could add toast notification here in the future
    }
  };



  const enabledNetworkDomains = selectedNetworks
    .filter(network => network.enabled)
    .map(network => network.domain);

  const enabledDomains = domains.filter(domain => 
    enabledNetworkDomains.includes(domain.domain)
  );

  const sortDomains = useCallback((option: string) => {
    // This function is now just for updating the sort option
    // The actual sorting is handled by useMemo
  }, []);



  const filteredEnabledDomains = enabledDomains.filter(domain =>
    domain.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (domain.displayName && domain.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Create a sorted version of the filtered domains
  const sortedFilteredDomains = useMemo(() => {
    const sorted = [...filteredEnabledDomains];
    switch (sortOption) {
      case 'uptime':
        sorted.sort((a, b) => getUptimeValue(b.uptimeList) - getUptimeValue(a.uptimeList));
        break;
      case 'highest-downtime':
        sorted.sort((a, b) => getUptimeValue(a.uptimeList) - getUptimeValue(b.uptimeList));
        break;
      default:
        // Default: sort by name (displayName or domain)
        sorted.sort((a, b) => {
          const nameA = (a.displayName || a.domain).toLowerCase();
          const nameB = (b.displayName || b.domain).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
    }
    return sorted;
  }, [filteredEnabledDomains, sortOption]);

  const getUptimeValue = (uptimeList?: UptimeList): number => {
    if (!uptimeList || Object.keys(uptimeList).length === 0) {
      return 0;
    }
    return Object.values(uptimeList)[0];
  };

  const getUptimeDisplay = (uptimeList?: UptimeList): string => {
    if (!uptimeList || Object.keys(uptimeList).length === 0) {
      return 'N/A';
    }
    const uptimeValue = Object.values(uptimeList)[0];
    return `${(uptimeValue * 100).toFixed(3)}%`;
  };

  const calculateAverageResponseTime = (urls: UrlData[]) => {
    const totalResponseTime = urls.reduce((sum, url) => sum + url.avg_response_time, 0);
    return urls.length > 0 ? totalResponseTime / urls.length : 0;
  };

  const NetworkUptimeContent = () => (
    <div className="pt-4 pl-4 pr-4 pb-6">
      <div className="space-y-3">
        {/* Header */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-green-100 rounded">
              <Wifi className="w-3 h-3 text-green-600" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-gray-900">Network Uptime Monitoring</h1>
              <p className="text-xs text-gray-600">Select networks to receive downtime notifications</p>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <AlertCircle className="h-3 w-3 mx-auto mb-1" />
              <p className="text-xs text-red-600">Error loading networks: {error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Network Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Add Network to Monitor
                </label>
                <select 
                  className="dashboard-select-small"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleNetworkToggle(e.target.value, true);
                      e.target.value = ""; // Reset selection
                    }
                  }}
                >
                  <option value="">Choose a network...</option>
                  {domains
                    .filter(domain => !selectedNetworks.find(n => n.domain === domain.domain && n.enabled))
                    .map((domain) => (
                      <option key={domain.domain} value={domain.domain}>
                        {domain.displayName || capitalizeNetworkName(domain.domain)}
                      </option>
                    ))}
                </select>
              </div>

              
            </div>
          )}
          
        </div>

        
        {/* Search and Filter Controls - Only show if networks are selected */}
        {enabledDomains.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search networks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex-shrink-0">
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="default">Sort by Name</option>
                  <option value="uptime">Sort by Uptime</option>
                  <option value="highest-downtime">Sort by Downtime</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Dashboard - Only show if networks are selected */}
        {enabledDomains.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-3">
              Live Monitoring ({sortedFilteredDomains.length} network{sortedFilteredDomains.length !== 1 ? 's' : ''})
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {sortedFilteredDomains.length > 0 ? (
                sortedFilteredDomains.map((domain) => (
                  <Card key={domain.domain} className="border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2">
                      <HoverCard>
                        <HoverCardTrigger>
                          <CardTitle className="text-xs font-medium cursor-pointer">
                            {getUptimeValue(domain.uptimeList) > 0.999 
                              ? 'All Systems Operational' 
                              : 'Some Systems Degraded'}
                          </CardTitle>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-white">System Status</h4>
                            <p className="text-xs text-gray-200">
                              {getUptimeValue(domain.uptimeList) > 0.999 
                                ? 'All systems are running normally with excellent uptime' 
                                : 'Some systems may be experiencing issues or degraded performance'}
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <HoverCard>
                        <HoverCardTrigger>
                          <div className="text-xs text-muted-foreground cursor-pointer">
                            {getUptimeDisplay(domain.uptimeList)} uptime
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-white">Uptime Details</h4>
                            <p className="text-xs text-gray-200">Current: {getUptimeDisplay(domain.uptimeList)}</p>
                            <p className="text-xs text-gray-200">Status: {getUptimeValue(domain.uptimeList) > 0.999 ? 'Excellent' : getUptimeValue(domain.uptimeList) > 0.97 ? 'Good' : 'Poor'}</p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </CardHeader>
                    <CardContent className="p-2 pt-0">
                      <div className="text-xs font-bold mb-2 text-left">
                        {domain.displayName || capitalizeNetworkName(domain.domain)}
                      </div>
                      <div className="mb-2">
                        {domain.hasStatusPage && domain.urls.some(url => url.heartbeats) ? (
                          <HeartbeatBar 
                            heartbeats={domain.urls.find(url => url.heartbeats)?.heartbeats || []} 
                            showTimeRange={true} 
                          />
                        ) : (
                          <UptimeBar uptimeList={domain.uptimeList} />
                        )}
                        <p className="text-left pt-2 text-xs text-gray-600">
                          Average Response Time: {calculateAverageResponseTime(domain.urls).toFixed(2)} ms
                        </p>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => {
                            // Immediately remove the card from UI - no delay
                            setSelectedNetworks(prev => 
                              prev.filter(n => n.domain !== domain.domain)
                            );
                            
                            // Fire and forget API call in background (no await, no delay)
                            if (user?.id) {
                              const network = selectedNetworks.find(n => n.domain === domain.domain);
                              if (network?.id) {
                                // Use setTimeout to ensure UI update happens first
                                setTimeout(() => {
                                  fetch('/api/network-monitors', {
                                    method: 'DELETE',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      id: network.id,
                                      user_id: user.id
                                    }),
                                  }).catch(error => {
                                    console.error('Error deleting network monitor:', error);
                                  });
                                }, 0);
                              }
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-800 underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-xs text-gray-500">No networks match your search criteria.</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search term or filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Message when no networks selected */}
        {enabledDomains.length === 0 && !isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <Bell className="h-3 w-3 text-blue-600 mx-auto mb-1" />
            <h3 className="text-xs font-medium text-blue-900 mb-1">No Networks Selected</h3>
            <p className="text-xs text-blue-700">
              Select affiliate networks above to start monitoring their uptime and receive notifications when they go down.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <NetworkUptimeContent />
    </DashboardLayout>
  );
}