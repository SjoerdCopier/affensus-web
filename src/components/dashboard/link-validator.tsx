"use client";

import React, { useState } from 'react';
import { Search, Clock, AlertTriangle, CheckCircle, Link } from 'lucide-react';
import { useLocaleTranslations } from '@/hooks/use-locale-translations';

interface Redirect {
  url: string;
  status_code: number;
  redirect_type: string;
  latency_ms: number;
  step: number;
  type: string;
  affiliate_network?: {
    name: string;
    networkId: number;
    userId?: string;
  };
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
}

export default function DashboardLinkValidator({ }: DashboardLinkValidatorProps) {
  const { t } = useLocaleTranslations();
  
  // Form state
  const [urlInput, setUrlInput] = useState<string>('');
  const [bulkUrls, setBulkUrls] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Results state
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ValidationResult | null>(null);
  
  // UI state
  const [showBulkMode, setShowBulkMode] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  
  // Statistics
  const [stats, setStats] = useState({
    totalChecked: 0,
    validLinks: 0,
    deadLinks: 0,
    redirectLoops: 0,
    multipleNetworks: 0,
  });

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
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        if (!responseData.success) {
          throw new Error(responseData.error || 'API returned unsuccessful response');
        }
        
        // The actual data is in responseData.data
        const data = responseData.data;
        const redirects: Redirect[] = data.redirect_chain || [];
        
        // Determine error type
        let errorType: ValidationResult['errorType'] = undefined;
        let hasError = false;
        
        const has404 = redirects.some((r: Redirect) => r.status_code === 404);
        const hasRedirectError = redirects.some((r: Redirect) => r.status_code >= 400);
        const uniqueNetworks = [...new Set(redirects.map((r: Redirect) => r.affiliate_network?.name).filter(Boolean))];
        
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
    try {
      const result = await validateLink(urlInput);
      setCurrentResult(result);
      setValidationResults(prev => [result, ...prev.slice(0, 99)]); // Keep last 100 results
      
      // Update statistics
      setStats(prev => ({
        totalChecked: prev.totalChecked + 1,
        validLinks: result.hasError ? prev.validLinks : prev.validLinks + 1,
        deadLinks: result.errorType === 'dead_link' ? prev.deadLinks + 1 : prev.deadLinks,
        redirectLoops: result.errorType === 'redirect_loop' ? prev.redirectLoops + 1 : prev.redirectLoops,
        multipleNetworks: result.errorType === 'multiple_networks' ? prev.multipleNetworks + 1 : prev.multipleNetworks,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkValidation = async () => {
    const urls = bulkUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) return;
    
    setIsLoading(true);
    setValidationResults([]);
    
    const newStats = {
      totalChecked: 0,
      validLinks: 0,
      deadLinks: 0,
      redirectLoops: 0,
      multipleNetworks: 0,
    };
    
    for (const url of urls) {
      try {
        const result = await validateLink(url.trim());
        setValidationResults(prev => [...prev, result]);
        
        // Update statistics
        newStats.totalChecked++;
        if (!result.hasError) newStats.validLinks++;
        if (result.errorType === 'dead_link') newStats.deadLinks++;
        if (result.errorType === 'redirect_loop') newStats.redirectLoops++;
        if (result.errorType === 'multiple_networks') newStats.multipleNetworks++;
        
        setStats(newStats);
      } catch (error) {
        console.error(`Failed to validate ${url}:`, error);
      }
    }
    
    setIsLoading(false);
  };

  const getStatusIcon = (result: ValidationResult) => {
    if (!result.hasError) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  const getErrorMessage = (errorType: ValidationResult['errorType']) => {
    switch (errorType) {
      case 'dead_link':
        return t('dashboard.linkValidator.errors.deadLink');
      case 'redirect_loop':
        return t('dashboard.linkValidator.errors.redirectLoop');
      case 'multiple_networks':
        return t('dashboard.linkValidator.errors.multipleNetworks');
      case 'error':
        return t('dashboard.linkValidator.errors.general');
      default:
        return '';
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

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t('dashboard.linkValidator.stats.total')}</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalChecked}</p>
            </div>
            <Link className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t('dashboard.linkValidator.stats.valid')}</p>
              <p className="text-lg font-bold text-green-600">{stats.validLinks}</p>
            </div>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t('dashboard.linkValidator.stats.dead')}</p>
              <p className="text-lg font-bold text-red-600">{stats.deadLinks}</p>
            </div>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
        </div>
        
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t('dashboard.linkValidator.stats.loops')}</p>
              <p className="text-lg font-bold text-orange-600">{stats.redirectLoops}</p>
            </div>
            <Clock className="h-4 w-4 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t('dashboard.linkValidator.stats.multiNetwork')}</p>
              <p className="text-lg font-bold text-yellow-600">{stats.multipleNetworks}</p>
            </div>
            <Search className="h-4 w-4 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded border border-gray-200 p-3 mb-4">
        {/* Toggle between single and bulk mode */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-900">
            {showBulkMode ? t('dashboard.linkValidator.bulkMode') : t('dashboard.linkValidator.singleMode')}
          </h2>
          <button
            onClick={() => setShowBulkMode(!showBulkMode)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showBulkMode ? t('dashboard.linkValidator.switchToSingle') : t('dashboard.linkValidator.switchToBulk')}
          </button>
        </div>

        {!showBulkMode ? (
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
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? t('dashboard.linkValidator.validating') : t('dashboard.linkValidator.validate')}
            </button>
          </form>
        ) : (
          <div>
            <div className="mb-3">
              <label htmlFor="bulk-urls" className="block text-xs font-medium text-gray-700 mb-1">
                {t('dashboard.linkValidator.form.bulkLabel')}
              </label>
              <textarea
                id="bulk-urls"
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                placeholder={t('dashboard.linkValidator.form.bulkPlaceholder')}
                rows={6}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleBulkValidation}
              disabled={isLoading || !bulkUrls.trim()}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? t('dashboard.linkValidator.validating') : t('dashboard.linkValidator.validateAll')}
            </button>
          </div>
        )}
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

      {/* Current Result Detail */}
      {currentResult && !showBulkMode && (
        <div className={`bg-white rounded border ${currentResult.hasError ? 'border-red-200' : 'border-green-200'} p-3 mb-4`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              {getStatusIcon(currentResult)}
              <h3 className="ml-2 text-sm font-semibold text-gray-900">
                {currentResult.hasError ? t('dashboard.linkValidator.issueDetected') : t('dashboard.linkValidator.linkValid')}
              </h3>
            </div>
            {currentResult.networkDetected && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {currentResult.networkDetected}
              </span>
            )}
          </div>

          {currentResult.hasError && currentResult.errorType && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-700">{getErrorMessage(currentResult.errorType)}</p>
            </div>
          )}

          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-gray-700">{t('dashboard.linkValidator.originalUrl')}:</p>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                <p className="text-xs text-gray-600 break-all font-mono" title={currentResult.original_url}>
                  {currentResult.original_url}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">{t('dashboard.linkValidator.finalUrl')}:</p>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                <p className="text-xs text-gray-600 break-all font-mono" title={currentResult.final_destination}>
                  {currentResult.final_destination}
                </p>
              </div>
            </div>
            {currentResult.proxy_usage && currentResult.proxy_usage.used && (
              <div>
                <p className="text-xs font-medium text-gray-700">Proxy Usage:</p>
                <div className="mt-1 p-2 bg-blue-50 rounded border">
                  <p className="text-xs text-blue-600">
                    Cost: ${currentResult.proxy_usage.cost_usd.toFixed(6)} USD | 
                    Data: {currentResult.proxy_usage.data_transferred_mb.toFixed(2)} MB | 
                    Time: {currentResult.total_time_ms.toFixed(1)}ms
                  </p>
                </div>
              </div>
            )}
            {currentResult.redirect_chain.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">
                  {t('dashboard.linkValidator.redirectChain')} ({currentResult.redirect_chain.length}):
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {currentResult.redirect_chain.map((redirect, index) => (
                    <div key={index} className="pl-3 border-l-2 border-gray-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 break-all font-mono" title={redirect.url}>
                            Step {redirect.step}. {redirect.url}
                          </p>
                          {redirect.latency_ms && (
                            <p className="text-xs text-gray-500">Latency: {redirect.latency_ms.toFixed(1)}ms</p>
                          )}
                        </div>
                        <span className={`text-xs px-1 py-0.5 rounded flex-shrink-0 ${
                          redirect.status_code < 300 
                            ? 'bg-green-100 text-green-700' 
                            : redirect.status_code >= 400
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {redirect.status_code} {redirect.redirect_type}
                        </span>
                      </div>
                      {redirect.affiliate_network && (
                        <p className="text-xs text-blue-600 mt-0.5">{redirect.affiliate_network.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results History */}
      {validationResults.length > 0 && (
        <div className="bg-white rounded border border-gray-200">
          <div className="px-3 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              {t('dashboard.linkValidator.history')}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.linkValidator.table.status')}
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.linkValidator.table.url')}
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.linkValidator.table.network')}
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.linkValidator.table.redirects')}
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.linkValidator.table.time')}
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.linkValidator.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {validationResults.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-2 py-1 whitespace-nowrap">
                      {getStatusIcon(result)}
                    </td>
                    <td className="px-2 py-1">
                      <div className="max-w-xs">
                        <p className="text-xs text-gray-900 break-all font-mono" title={result.original_url}>
                          {result.original_url}
                        </p>
                        {result.hasError && result.errorType && (
                          <p className="text-xs text-red-600 mt-0.5">{getErrorMessage(result.errorType)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {result.networkDetected ? (
                        <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {result.networkDetected}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <span className="text-xs text-gray-600">{result.total_redirects}</span>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <span className="text-xs text-gray-600">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedResult(selectedResult === index ? null : index)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {selectedResult === index ? t('dashboard.linkValidator.table.hide') : t('dashboard.linkValidator.table.details')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
