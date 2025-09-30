"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Copy, Check, Flag, Globe, BarChart3, Network, Clock } from 'lucide-react';
import { useLocaleTranslations } from '@/hooks/use-locale-translations';
import { CountrySelect } from '@/components/ui/country-select';
import { useUser } from '@/hooks/use-user';

interface Flag {
  name: string;
  flag_type: string;
  description: string;
  severity: string;
}

interface TrackingSoftware {
  name: string;
  campaignId?: string;
  publisherId?: string;
}

interface Redirect {
  url: string;
  status_code: number;
  redirect_type: string;
  latency_ms: number;
  step: number;
  type: string;
  flags?: Flag[];
  affiliate_network?: {
    name: string;
    networkId: number;
    userId?: string;
    programId?: string;
  };
  advertiser?: {
    name: string;
  };
  tracking_software?: TrackingSoftware;
}

interface ValidationResult {
  original_url: string;
  final_destination: string;
  redirect_chain: Redirect[];
  total_redirects: number;
  total_time_ms: number;
  proxy_usage?: {
    used: boolean;
    cost_usd: number;
    cost_per_gb_usd: number;
    data_transferred_bytes: number;
    data_transferred_mb: number;
  };
  networkDetected?: string;
  hasError: boolean;
  errorType?: 'dead_link' | 'redirect_loop' | 'multiple_networks' | 'error';
  timestamp: Date;
  success: boolean;
}

interface DashboardLinkValidatorProps {
  locale?: string;
  selectedProject?: {
    id: string;
    name: string;
    country: string;
  } | null;
}

export default function DashboardLinkValidator({ selectedProject }: DashboardLinkValidatorProps) {
  const { t } = useLocaleTranslations();
  const { user } = useUser();
  
  // Form state
  const [urlInput, setUrlInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [proxyCountry, setProxyCountry] = useState<string>('');
  
  // Results state
  const [currentResult, setCurrentResult] = useState<ValidationResult | null>(null);
  const [expandedUrls, setExpandedUrls] = useState<Set<number>>(new Set());
  const [copiedUrls, setCopiedUrls] = useState<Set<number>>(new Set());
  const [resultMessage, setResultMessage] = useState<React.ReactNode>("");
  const [has404, setHas404] = useState(false);
  const [multipleNetworks, setMultipleNetworks] = useState(false);
  const [hasRedirectError, setHasRedirectError] = useState(false);
  const [checkUuid, setCheckUuid] = useState("");
  
  // Set default proxy country from selected project
  useEffect(() => {
    if (selectedProject?.country && !proxyCountry) {
      setProxyCountry(selectedProject.country);
    }
  }, [selectedProject, proxyCountry]);

  // Helper function to truncate URL for display
  const truncateUrl = (url: string, maxLength: number = 60): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  // Helper function to truncate URL in the middle
  const truncateUrlMiddle = (url: string, maxLength: number = 80): string => {
    if (url.length <= maxLength) return url;
    const start = Math.floor((maxLength - 3) / 2);
    const end = Math.ceil((maxLength - 3) / 2);
    return url.substring(0, start) + '...' + url.substring(url.length - end);
  };

  // Helper function to get flag styling based on severity
  const getFlagStyling = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600'
        };
      case 'medium':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'low':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  // Function to toggle URL expansion
  const toggleUrlExpansion = (index: number) => {
    setExpandedUrls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Function to copy URL to clipboard
  const copyUrl = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrls(prev => new Set(prev).add(index));
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const validateLink = async (url: string): Promise<ValidationResult> => {
    try {
      const apiEndpoint = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8788/api/tools/affiliate-link-checker'
        : '/api/tools/affiliate-link-checker';
        
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          ...(proxyCountry && {
            proxy: true,
            country: proxyCountry
          })
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        if (!responseData.success) {
          throw new Error(responseData.error || 'API returned unsuccessful response');
        }
        
        // The actual data is in responseData.data
        const data = responseData.data;
        const redirects: Redirect[] = data.redirect_chain || [];
        
        // Determine error type and set state variables
        let errorType: ValidationResult['errorType'] = undefined;
        let hasError = false;
        
        const has404 = redirects.some((r: Redirect) => r.status_code === 404);
        const hasRedirectError = redirects.some((r: Redirect) => r.status_code >= 400);
        const uniqueNetworks = [...new Set(redirects.map((r: Redirect) => r.affiliate_network?.name).filter(Boolean))];
        
        // Update state variables for result display
        setHas404(has404);
        setHasRedirectError(hasRedirectError);
        setMultipleNetworks(uniqueNetworks.length > 1);
        setCheckUuid(data.uuid || "");
        
        if (has404) {
          errorType = 'dead_link';
          hasError = true;
        } else if (hasRedirectError) {
          errorType = 'error';
          hasError = true;
        } else if (uniqueNetworks.length > 1) {
          errorType = 'multiple_networks';
          hasError = true;
        }
        
        return {
          original_url: data.original_url || url,
          final_destination: data.final_destination || url,
          redirect_chain: redirects,
          total_redirects: data.total_redirects || redirects.length,
          total_time_ms: data.total_time_ms || 0,
          proxy_usage: data.proxy_usage,
          networkDetected: uniqueNetworks[0],
          hasError,
          errorType,
          timestamp: new Date(),
          success: data.success !== false,
        };
      } else {
        throw new Error('Failed to validate link');
      }
      } catch {
        return {
          original_url: url,
          final_destination: url,
          redirect_chain: [],
          total_redirects: 0,
          total_time_ms: 0,
          hasError: true,
          errorType: 'error',
          timestamp: new Date(),
          success: false,
        };
      }
  };

  const handleSingleValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    
    setIsLoading(true);
    setResultMessage("");
    setHas404(false);
    setMultipleNetworks(false);
    setHasRedirectError(false);
    setCheckUuid("");
    
    try {
      const result = await validateLink(urlInput);
      setCurrentResult(result);
      
      // Set appropriate result message based on the analysis
      if (hasRedirectError) {
        setResultMessage(
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-20 h-20 mt-1"
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path>
            </svg>
            <div className="ml-4">
              {t('tools.affiliateLinkChecker.messages.deadEnd')}
            </div>
          </>
        );
      } else if (has404) {
        setResultMessage(
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-20 h-20 mt-1"
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path>
            </svg>
            <div className="ml-4">
              {t('tools.affiliateLinkChecker.messages.deadLink')}
            </div>
          </>
        );
      } else if (multipleNetworks) {
        const uniqueNetworks = [...new Set(result.redirect_chain.map((r: Redirect) => r.affiliate_network?.name).filter(Boolean))];
        const firstNetwork = uniqueNetworks[0] as string;
        setResultMessage(
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-20 h-20 mt-1"
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path>
            </svg>
            <div className="ml-4">
              {t('tools.affiliateLinkChecker.messages.multipleNetworks').replace('{network}', firstNetwork)}
            </div>
          </>
        );
      } else if (result.redirect_chain.length === 1) {
        // Only 1 step means no redirects - likely not an affiliate link
        setResultMessage(
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-20 h-20 mt-1"
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path>
            </svg>
            <div className="ml-4">
              {t('tools.affiliateLinkChecker.messages.likelyNotAffiliate')}
            </div>
          </>
        );
      } else {
        setResultMessage(
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-20 h-20 mt-1"
            >
              <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"></path>
            </svg>
            <div className="ml-4">
              {t('tools.affiliateLinkChecker.messages.success')}
            </div>
          </>
        );
      }
    } catch (error) {
      console.error('Error:', error);
      setResultMessage(
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-20 h-20 mt-1"
          >
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path>
          </svg>
          <div className="ml-4">
            {t('tools.affiliateLinkChecker.messages.error')}
          </div>
        </>
      );
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="pt-4 pl-4 pr-4 pb-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-900 mb-1">
          {t('dashboard.linkValidator.title')}
        </h1>
        <p className="text-xs text-gray-600">
          {t('dashboard.linkValidator.description')}
        </p>
      </div>


      {/* Input Section */}
      <div className="bg-white rounded border border-gray-200 p-3 mb-4">
        <form onSubmit={handleSingleValidation}>
          <div className="mb-3">
            <label htmlFor="url-input" className="block text-xs font-medium text-gray-700 mb-1">
              {t('dashboard.linkValidator.form.urlLabel')}
            </label>
            <input
              type="url"
              id="url-input"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t('dashboard.linkValidator.form.urlPlaceholder')}
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Proxy */}
          <div className="mb-3">
            <label htmlFor="proxy-country" className="block text-xs font-medium text-gray-700 mb-1">
              Proxy
            </label>
            <CountrySelect
              value={proxyCountry}
              onValueChange={setProxyCountry}
              placeholder="Select proxy country..."
            />
            {!user && (
              <p className="text-xs text-red-500 mt-1">
                (Login to use proxy function for better results)
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? t('dashboard.linkValidator.validating') : t('dashboard.linkValidator.validate')}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded border border-gray-200 p-3 mb-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-xs text-gray-600">{t('dashboard.linkValidator.analyzing')}</span>
          </div>
        </div>
      )}

      {/* Results Container */}
      {(resultMessage || (currentResult && currentResult.redirect_chain.length > 0)) && (
        <div className="bg-white rounded border border-gray-200 p-6 mb-4">
          {/* Result Message */}
          {resultMessage && (
            <div className={`p-4 border rounded-md flex items-start mb-6 ${has404 || hasRedirectError ? 'bg-red-100 text-red-700 border-red-300' : multipleNetworks || (currentResult && currentResult.redirect_chain.length === 1) ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-green-100 text-green-700 border-green-300'}`}>
              {resultMessage}
            </div>
          )}
          
          {/* Detailed Results */}
          {currentResult && currentResult.redirect_chain.length > 0 && (
            <div>
              {/* Redirect Chain Analysis Header */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirect Chain Analysis</h2>
                <div className="text-gray-600">
                  {currentResult.redirect_chain.length} steps • Total time: {currentResult.redirect_chain.reduce((total, redirect) => total + (redirect.latency_ms || 0), 0).toFixed(2)}ms
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Final destination: {currentResult.redirect_chain.length > 0 ? truncateUrl(currentResult.redirect_chain[currentResult.redirect_chain.length - 1].url, 60) : 'N/A'}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-700">Redirect Chain</h3>
              <ul className="mt-4 space-y-2">
                {currentResult.redirect_chain.map((redirect: Redirect, index: number) => {
                  const hasFlags = redirect.flags && redirect.flags.length > 0;
                  const hasHighSeverityFlags = hasFlags && redirect.flags!.some(flag => flag.severity.toLowerCase() === 'high');
                  
                  return (
                    <li key={index} className={`p-4 border rounded-md ${hasHighSeverityFlags ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                      <div className="text-sm text-gray-500 mb-2">
                        Step {redirect.step} - {redirect.type === 'original' ? 'Original URL' : redirect.type === 'final' ? 'Final Destination' : 'Redirect'}
                      </div>
                      
                      {/* URL with expand/collapse and copy */}
                      <div className="flex items-start gap-2 mb-3">
                        <button
                          onClick={() => toggleUrlExpansion(index)}
                          className="flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
                          title={expandedUrls.has(index) ? "Collapse URL" : "Expand URL"}
                        >
                          {expandedUrls.has(index) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <a 
                            href={redirect.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-mono break-all"
                            title={redirect.url}
                          >
                            {expandedUrls.has(index) ? redirect.url : truncateUrlMiddle(redirect.url, 80)}
                          </a>
                        </div>
                        <button
                          onClick={() => copyUrl(redirect.url, index)}
                          className="flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
                          title="Copy URL"
                        >
                          {copiedUrls.has(index) ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Flags display */}
                      {hasFlags && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {redirect.flags!.map((flag, flagIndex) => {
                              const styling = getFlagStyling(flag.severity);
                              return (
                                <div
                                  key={flagIndex}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${styling.bgColor} ${styling.textColor} ${styling.borderColor}`}
                                  title={`${flag.name}: ${flag.description}`}
                                >
                                  <Flag className={`w-3 h-3 ${styling.iconColor}`} />
                                  <span>{flag.name}</span>
                                  {flag.severity.toLowerCase() === 'high' && (
                                    <AlertTriangle className="w-3 h-3 text-red-600" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Badges below URL */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Advertiser badge */}
                        {redirect.advertiser?.name && (
                          <span className="inline-flex items-center justify-center rounded-md border border-purple-300 bg-purple-50 px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-purple-800 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground text-xs">
                            <Globe className="w-3 h-3 mr-1" aria-hidden="true" />
                            {redirect.advertiser.name}
                          </span>
                        )}
                        
                        {/* Network badge */}
                        {redirect.affiliate_network?.name && (
                          <span className="inline-flex items-center justify-center rounded-md border border-indigo-300 bg-indigo-50 px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-indigo-800 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground text-xs">
                            <Network className="w-3 h-3 mr-1" aria-hidden="true" />
                            {redirect.affiliate_network.name}
                          </span>
                        )}
                        
                        {/* Show "Unknown" badge only if no advertiser and no network */}
                        {!redirect.advertiser?.name && !redirect.affiliate_network?.name && !redirect.tracking_software && (
                          <span className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-slate-700 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground text-xs">
                            <Globe className="w-3 h-3 mr-1" aria-hidden="true" />
                            Unknown
                          </span>
                        )}
                        
                        {/* Tracking software badge */}
                        {redirect.tracking_software && (
                          <span className="inline-flex items-center justify-center rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-emerald-800 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground text-xs">
                            <BarChart3 className="w-3 h-3 mr-1" aria-hidden="true" />
                            {redirect.tracking_software.name}
                          </span>
                        )}
                        
                        {/* Status code badge */}
                        <span className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent text-xs ${
                          redirect.status_code < 300 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : redirect.status_code < 400 
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {redirect.status_code} {redirect.redirect_type}
                        </span>
                        
                        {/* Latency badge */}
                        {redirect.latency_ms && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {redirect.latency_ms.toFixed(1)}ms
                          </div>
                        )}
                      </div>
                      
                      {redirect.affiliate_network && (redirect.affiliate_network.userId || redirect.affiliate_network.programId) && (
                        <div className="text-sm text-gray-600 mt-2">
                          {redirect.affiliate_network.userId && (
                            <div className="text-xs text-gray-500">
                              User ID: {redirect.affiliate_network.userId}
                            </div>
                          )}
                          {redirect.affiliate_network.programId && (
                            <div className="text-xs text-gray-500">
                              Program ID: {(() => {
                                try {
                                  return decodeURIComponent(redirect.affiliate_network.programId);
                                } catch {
                                  return redirect.affiliate_network.programId;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {redirect.tracking_software && (redirect.tracking_software.campaignId || redirect.tracking_software.publisherId) && (
                        <div className="text-sm text-gray-600 mt-2">
                          {redirect.tracking_software.campaignId && (
                            <div className="text-xs text-gray-500">
                              Campaign ID: {redirect.tracking_software.campaignId}
                            </div>
                          )}
                          {redirect.tracking_software.publisherId && (
                            <div className="text-xs text-gray-500">
                              Publisher ID: {redirect.tracking_software.publisherId}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              
              {/* Redirect Statistics */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-black mb-4">Redirect Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">
                      {currentResult.redirect_chain.length}
                    </div>
                    <div className="text-sm text-black">Total Redirects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">
                      {currentResult.redirect_chain.reduce((total, redirect) => total + (redirect.latency_ms || 0), 0).toFixed(1)}ms
                    </div>
                    <div className="text-sm text-black">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">
                      {currentResult.redirect_chain.length > 0 
                        ? (currentResult.redirect_chain.reduce((total, redirect) => total + (redirect.latency_ms || 0), 0) / currentResult.redirect_chain.length).toFixed(0) + 'ms'
                        : '0ms'
                      }
                    </div>
                    <div className="text-sm text-black">Avg per Step</div>
                  </div>
                </div>
              </div>
              
              {/* URL Check Results Summary */}
              <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">URL Check Results</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Check ID:</span>
                    <span className="text-gray-600">{checkUuid || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Checked on:</span>
                    <span className="text-gray-600">{new Date().toLocaleString('en-GB', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Total Steps:</span>
                    <span className="text-gray-600">{currentResult.redirect_chain.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Final Status:</span>
                    <span className={`font-medium ${
                      hasRedirectError ? 'text-red-500' : 
                      has404 ? 'text-red-500' : 
                      multipleNetworks ? 'text-yellow-500' : 
                      'text-green-500'
                    }`}>
                      {hasRedirectError ? 'Error' : 
                       has404 ? '404 Not Found' : 
                       multipleNetworks ? 'Multiple Networks' : 
                       'Success'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setUrlInput('');
                      setProxyCountry(selectedProject?.country || '');
                      setCurrentResult(null);
                      setResultMessage('');
                      setHas404(false);
                      setMultipleNetworks(false);
                      setHasRedirectError(false);
                      setCheckUuid("");
                    }}
                    className="bg-[#6ca979] hover:bg-[#5a8a66] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Check another URL
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      // Remove networkId from the data
                      const cleanedRedirects = currentResult.redirect_chain.map(redirect => {
                        const { affiliate_network, ...rest } = redirect;
                        if (affiliate_network) {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { networkId, ...cleanNetwork } = affiliate_network;
                          return { ...rest, affiliate_network: cleanNetwork };
                        }
                        return rest;
                      });
                      
                      const jsonData = JSON.stringify(cleanedRedirects, null, 2);
                      navigator.clipboard.writeText(jsonData).then(() => {
                        // Visual feedback
                        const button = e.target as HTMLButtonElement;
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        button.classList.add('bg-green-600');
                        button.classList.remove('bg-gray-600');
                        setTimeout(() => {
                          button.textContent = originalText;
                          button.classList.remove('bg-green-600');
                          button.classList.add('bg-gray-600');
                        }, 1500);
                      }).catch(err => {
                        console.error('Failed to copy JSON:', err);
                      });
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Copy as JSON
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<redirects>
${currentResult.redirect_chain.map(redirect => `  <redirect>
    <step>${redirect.step}</step>
    <url>${redirect.url}</url>
    <status_code>${redirect.status_code}</status_code>
    <redirect_type>${redirect.redirect_type}</redirect_type>
    <type>${redirect.type}</type>
    ${redirect.latency_ms ? `<latency_ms>${redirect.latency_ms}</latency_ms>` : ''}
    ${redirect.affiliate_network ? `<affiliate_network>
      <name>${redirect.affiliate_network.name}</name>
      ${redirect.affiliate_network.userId ? `<userId>${redirect.affiliate_network.userId}</userId>` : ''}
      ${redirect.affiliate_network.programId ? `<programId>${redirect.affiliate_network.programId}</programId>` : ''}
    </affiliate_network>` : ''}
  </redirect>`).join('\n')}
</redirects>`;
                      navigator.clipboard.writeText(xmlData).then(() => {
                        // Visual feedback
                        const button = e.target as HTMLButtonElement;
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        button.classList.add('bg-green-600');
                        button.classList.remove('bg-gray-600');
                        setTimeout(() => {
                          button.textContent = originalText;
                          button.classList.remove('bg-green-600');
                          button.classList.add('bg-gray-600');
                        }, 1500);
                      }).catch(err => {
                        console.error('Failed to copy XML:', err);
                      });
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Copy as XML
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
