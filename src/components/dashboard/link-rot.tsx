"use client";

import React, { useState, useEffect } from 'react';
import { Project } from '../../hooks/use-project-selection';
import { useProjectLinkRot } from '../../hooks/use-project-link-rot';
import { getStatusBadgeStyles } from '../../lib/status-utils';

interface LinkRotProps {
  locale?: string;
  selectedProject?: Project | null;
}

interface LinkRotItem {
  id: string;
  merchant_name: string;
  status: string;
  network: string;
  slug: string;
  your_id: string;
  type: 'broken_link' | 'invalid_item';
  url?: string; // For invalid items
}

export default function DashboardLinkRot({ selectedProject }: LinkRotProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch link-rot data using the hook
  const { linkRotData, isLoading, error, refreshLinkRot } = useProjectLinkRot(selectedProject?.id || null);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, networkFilter, typeFilter, rowsPerPage]);

  // Get link rot items from the API response and transform the data
  const brokenLinkItems: LinkRotItem[] = linkRotData?.broken_links?.map((item) => ({
    id: item.external_id || item.program_id || '',
    merchant_name: item.clean_name || 'Unknown',
    status: item.status || 'Unknown',
    network: item.network_name || 'Unknown',
    slug: item.slug || '',
    your_id: item.external_id || '',
    type: 'broken_link' as const
  })) || [];

  // Get invalid items from the API response and transform the data
  const invalidItems: LinkRotItem[] = linkRotData?.invalid_items?.map((item) => ({
    id: item.externalId || item.slug || '',
    merchant_name: item.slug || 'Unknown',
    status: 'Unknown Item',
    network: item.network || 'Unknown',
    slug: item.slug || '',
    your_id: item.externalId || '',
    type: 'invalid_item' as const,
    url: item.url
  })) || [];

  // Combine both broken links and invalid items
  const linkRotItems: LinkRotItem[] = [...brokenLinkItems, ...invalidItems];

  // Filter data based on search and filters
  const filteredData = linkRotItems.filter(item => {
    const matchesSearch = item.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.network.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.your_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.url && item.url.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesNetwork = !networkFilter || item.network === networkFilter;
    const matchesType = !typeFilter || item.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesNetwork && matchesType;
  });

  // Apply pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Get unique networks and statuses for filter dropdowns
  const uniqueNetworks = [...new Set(linkRotItems.map(item => item.network))].sort();
  const uniqueStatuses = [...new Set(linkRotItems.map(item => item.status))].sort();

  // Show loading state
  if (isLoading) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-xs">Loading link rot data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <p className="text-red-600 text-xs mb-4">Failed to load link rot data: {error}</p>
            <button 
              onClick={() => refreshLinkRot()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show no project selected state
  if (!selectedProject) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Please select a project to view link rot data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pl-4 pr-4 pb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-lg font-bold">Link Rot Analysis</h1>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              Project: {selectedProject.name}
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 mb-4 justify-between items-center">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search merchants, networks, slugs, URLs..."
              className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
            >
              <option value="">All Networks</option>
              {uniqueNetworks.map(network => (
                <option key={network} value={network}>{network}</option>
              ))}
            </select>
            <select
              className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="broken_link">Broken Links</option>
              <option value="invalid_item">Unknown Items</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setNetworkFilter('');
                setTypeFilter('');
              }}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 px-2 py-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500"></th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Type</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Merchant/Item</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Network</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Slug</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Your ID</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">URL</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedData.length > 0 ? (
                  displayedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1">
                        <input
                          type="checkbox"
                          className="border border-gray-200 rounded text-xs"
                        />
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'broken_link' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {item.type === 'broken_link' ? 'Broken Link' : 'Unknown Item'}
                        </span>
                      </td>
                      <td className="px-2 py-1">
                        <div className="text-xs font-medium text-gray-900">{item.merchant_name}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <span className={getStatusBadgeStyles(item.status)}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        {item.network}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        {item.slug}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        {item.your_id}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-900">
                        {item.url ? (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {item.url.length > 50 ? `${item.url.substring(0, 50)}...` : item.url}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-2 py-8 text-center text-xs text-gray-500">
                      No link rot data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-gray-50 px-2 py-1 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Showing: {displayedData.length} of {filteredData.length} filtered ({linkRotItems.length} total) items
              </p>
              <div className="flex items-center space-x-2">
                {totalPages > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 px-2 py-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                      Previous
                    </button>
                    <span className="text-xs text-gray-500 px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 px-2 py-1"
                    >
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </>
                )}
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                  <option value={150}>150 rows</option>
                  <option value={200}>200 rows</option>
                  <option value={250}>250 rows</option>
                  <option value={500}>500 rows</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
