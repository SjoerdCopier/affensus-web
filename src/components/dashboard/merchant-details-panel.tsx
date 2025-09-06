'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  CircleX, 
  MessageSquareText, 
  Mail, 
  UserPlus, 
  MoreVertical,
  BadgePercent,
  Code,
  Copy,
  Link2,
  Loader2
} from 'lucide-react';

interface CommissionPayout {
  currency: string;
  item: string;
  value: string;
}

interface Merchant {
  id: number;
  clean_name: string;
  status: string;
  display_url: string;
  published_tag?: string;
  created_at?: string;
  updated_at?: string;
  deeplink?: string;
  logo?: string;
  countries?: string[];
  domains?: string;
  program_id?: string;
  identifier_id?: string;
  commission?: {
    payouts?: {
      CPS?: CommissionPayout[];
      CPA?: CommissionPayout[];
      CPL?: CommissionPayout[];
    };
  };
}

interface ValidationResult {
  url: string;
  status: number | string;
  type: string;
  name: string | null;
  error?: string;
}

interface MerchantDetailsPanelProps {
  merchant: Merchant | null;
  onClose: () => void;
}

export function MerchantDetailsPanel({ merchant, onClose }: MerchantDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('campaign');
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);
  const deeplink = merchant?.deeplink || '';

  const copyTrackingLink = async () => {
    if (!deeplink.trim()) return;
    
    try {
      await navigator.clipboard.writeText(deeplink);
      setCopied(true);
      setTimeout(() => setCopied(false), 500);
    } catch (error) {
      console.error('Failed to copy tracking link:', error);
    }
  };

  const validateTrackingLink = async () => {
    if (!deeplink.trim()) return;
    
    setIsValidating(true);
    setValidationResults([]);
    
    try {
      const response = await fetch('/api/tools/affiliate-link-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: deeplink }),
      });
      
      if (!response.ok) {
        throw new Error('Validation failed');
      }
      
      const data = await response.json();
      setValidationResults(data.redirects || []);
    } catch (error) {
      console.error('Error validating tracking link:', error);
      setValidationResults([{
        url: deeplink,
        status: 'error',
        type: 'Validation Error',
        name: null,
        error: 'Failed to validate tracking link'
      }]);
    } finally {
      setIsValidating(false);
    }
  };

  if (!merchant) return null;

  return (
    <div style={{ transform: 'scale(0.9)', transformOrigin: 'top left', width: '111.11%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex justify-between items-center">
        <h2 className="text-sm font-semibold">Merchant Details</h2>
      </div>

      {/* User Section */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="relative flex shrink-0 overflow-hidden rounded-full h-7 w-7">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">Sj</span>
          </span>
          <span className="ml-2 text-xs font-medium">Sjoerd Copier</span>
        </div>
        <div className="flex items-center space-x-1">
          <button className="flex items-center bg-white text-black border border-gray-300 p-1.5 rounded-md">
            <MessageSquareText className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center bg-white text-black border border-gray-300 p-1.5 rounded-md">
            <Mail className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center bg-white text-black border border-gray-300 px-2 py-1.5 rounded-md text-xs">
            <UserPlus className="w-3.5 h-3.5 mr-1" />
            Assign
          </button>
          <div className="relative">
            <button className="flex items-center bg-white text-black border border-gray-300 p-1.5 rounded-md">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center space-x-3 relative">
        <button 
          onClick={() => setActiveTab('campaign')}
          className={`text-xs font-medium px-2 py-1 relative ${
            activeTab === 'campaign' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Campaign Details
          {activeTab === 'campaign' && (
            <div className="absolute bottom-[-13px] left-0 w-full h-0.5 bg-black"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('store')}
          className={`text-xs font-medium px-2 py-1 relative ${
            activeTab === 'store' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Store Details
          {activeTab === 'store' && (
            <div className="absolute bottom-[-13px] left-0 w-full h-0.5 bg-black"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('deals')}
          className={`text-xs font-medium px-2 py-1 relative ${
            activeTab === 'deals' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Deals
          {activeTab === 'deals' && (
            <div className="absolute bottom-[-13px] left-0 w-full h-0.5 bg-black"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('socials')}
          className={`text-xs font-medium px-2 py-1 relative ${
            activeTab === 'socials' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Socials
          {activeTab === 'socials' && (
            <div className="absolute bottom-[-13px] left-0 w-full h-0.5 bg-black"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('keywords')}
          className={`text-xs font-medium px-2 py-1 relative ${
            activeTab === 'keywords' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Keywords
          {activeTab === 'keywords' && (
            <div className="absolute bottom-[-13px] left-0 w-full h-0.5 bg-black"></div>
          )}
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-grow flex flex-col overflow-hidden" style={{ flex: 1 }}>
        <div className="p-4 flex-grow overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <CircleX className="w-5 h-5" />
          </button>

          {/* Logo and Title */}
          <div className="flex mb-4">
            <div className="w-[200px] h-[120px] flex items-center justify-center border-2 border-gray-200 rounded mr-3 relative">
              {merchant.logo ? (
                <Image 
                  alt={`${merchant.clean_name} logo`} 
                  className="max-w-[90%] max-h-[90%] object-contain" 
                  src={merchant.logo}
                  width={180}
                  height={108}
                  unoptimized
                />
              ) : (
                <div className="text-gray-400 text-xs">No logo</div>
              )}
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold">{merchant.clean_name}</h2>
                <p className="text-[10px] text-gray-600">Program ID: {merchant.program_id || merchant.identifier_id || merchant.id}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-semibold text-gray-600">Status</h3>
              <div className="mt-1 text-blue-600 font-semibold text-xs">
                {merchant.status === 'joined' ? 'Joined' : 'Not joined'}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-600">Display URL</h3>
              <div className="mt-1">
                <div className="relative group flex items-center">
                  <a 
                    href={merchant.display_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline mr-2 text-xs"
                  >
                    {merchant.display_url}
                  </a>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-600">Domains</h3>
              <div className="mt-1">
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    if (merchant.domains) {
                      try {
                        const domains = JSON.parse(merchant.domains);
                        return domains.map((domain: string, index: number) => (
                          <span key={index} className="bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded transition-colors duration-200">
                            {domain}
                          </span>
                        ));
                      } catch {
                        // If parsing fails, show the display URL hostname
                        try {
                          return (
                            <span className="bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded transition-colors duration-200">
                              {new URL(merchant.display_url).hostname}
                            </span>
                          );
                        } catch {
                          return (
                            <span className="bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded transition-colors duration-200">
                              {merchant.display_url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                            </span>
                          );
                        }
                      }
                    } else {
                      // No domains field, use display URL
                      try {
                        return (
                          <span className="bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded transition-colors duration-200">
                            {new URL(merchant.display_url).hostname}
                          </span>
                        );
                      } catch {
                        return (
                          <span className="bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded transition-colors duration-200">
                            {merchant.display_url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                          </span>
                        );
                      }
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Deeplink */}
            <div className="col-span-2 pt-6">
              <h3 className="text-xs font-semibold text-gray-600">Deeplink</h3>
              <div className="mt-1 flex">
                <input 
                  readOnly 
                  className="flex-grow p-1.5 border border-gray-300 bg-gray-50 rounded-l-md text-xs" 
                  placeholder="" 
                  type="text" 
                  value={deeplink}
                />
                <button 
                  onClick={copyTrackingLink}
                  disabled={!deeplink.trim()}
                  className={`px-2 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    copied ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={validateTrackingLink}
                  disabled={isValidating || !deeplink.trim()}
                  className="bg-gray-100 text-gray-500 p-1.5 border border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors flex items-center justify-center w-24 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Link2 className="w-3 h-3 mr-1" />
                  )}
                  Validate
                </button>
              </div>
              <div className="mt-2 min-h-[60px]">
                {validationResults.length > 0 && (
                  <div className="text-sm">
                    <div className="mt-2 pl-4 flex items-start">
                      <div className="w-8 h-4 border-l border-b rounded-bl-md border-gray-300 mr-1"></div>
                      <span className="text-sm mt-[3px]">
                        {validationResults
                          .filter(result => result.name)
                          .map((result, index, filteredResults) => (
                            <span key={index}>
                              <span>{result.name}</span>
                              {index < filteredResults.length - 1 && (
                                <span className="text-gray-400 mx-1">→</span>
                              )}
                            </span>
                          ))
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Commission Table */}
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-gray-600">Commission</h3>
            <div className="mt-1">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {merchant.commission?.payouts ? (
                    Object.entries(merchant.commission.payouts).flatMap(([type, payouts]) =>
                      payouts?.map((payout, index) => (
                        <tr key={`${type}-${index}`}>
                          <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                            {type}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {payout.item}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {payout.value}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {payout.currency || '-'}
                          </td>
                        </tr>
                      )) || []
                    )
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-center text-xs text-gray-500">
                        No commission data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex flex-col space-y-1.5">
            <button className="bg-white hover:bg-gray-100 text-gray-600 font-medium py-1 px-2 border border-gray-300 rounded-lg shadow-sm text-xs flex items-center">
              <span className="mr-1.5">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100">
                  <BadgePercent className="w-3 h-3" />
                </div>
              </span>
              Create deals and scrape coupons
            </button>
            <button className="bg-white hover:bg-gray-100 text-gray-600 font-medium py-1 px-2 border border-gray-300 rounded-lg shadow-sm text-xs flex items-center">
              <span className="mr-1.5">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-100">
                  <Code className="w-3 h-3" />
                </div>
              </span>
              Create Merchant store
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-100 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-x-4 text-[10px] text-gray-600">
          <div>
            <span className="text-gray-500">Created:</span>
            <div>{merchant.created_at ? new Date(merchant.created_at).toLocaleString('en-GB', { 
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }) : 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-500">Updated:</span>
            <div>{merchant.updated_at ? new Date(merchant.updated_at).toLocaleString('en-GB', { 
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }) : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
