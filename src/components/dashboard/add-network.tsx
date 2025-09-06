'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Network } from 'lucide-react';
import { CountrySelect } from '../ui/country-select';

interface NetworkSchema {
  id: number;
  name: string;
  credential_schema: Record<string, unknown>;
}

interface CredentialSchemasResponse {
  networks: NetworkSchema[];
}

interface AddNetworkProps {
  locale?: string;
  selectedProject?: { id: string } | null;
}

export default function AddNetworkContent({ locale, selectedProject }: AddNetworkProps) {
  const router = useRouter();
  const [networks, setNetworks] = useState<NetworkSchema[]>([]);
  const [filteredNetworks, setFilteredNetworks] = useState<NetworkSchema[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state for credential fields
  const [formData, setFormData] = useState<{ [key: string]: string }>({
    name: '',
  });

  // Fetch credential schemas on component mount
  useEffect(() => {
    const fetchCredentialSchemas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/credential-schemas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch networks: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error('Invalid response format');
        }

        const data: CredentialSchemasResponse = result.data;
        setNetworks(data.networks || []);
        setFilteredNetworks(data.networks || []);
      } catch (err) {
        console.error('Error fetching credential schemas:', err);
        setError(err instanceof Error ? err.message : 'Failed to load networks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredentialSchemas();
  }, []);

  // Filter networks based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNetworks(networks);
    } else {
      const filtered = networks.filter(network =>
        network.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNetworks(filtered);
    }
  }, [searchTerm, networks]);

  const handleNetworkSelect = (network: NetworkSchema) => {
    setSelectedNetwork(network);
    setSearchTerm(network.name);
    setShowDropdown(false);
    
    // Initialize form data with credential name
    setFormData({
      name: `${network.name} Account`,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!selectedNetwork || !selectedProject) {
      setError('Network and project selection required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Prepare credentials data for encryption (exclude name field)
      const credentialsData: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'name' && value) {
          credentialsData[key] = value;
        }
      });

      // Send unencrypted credentials data to server - encryption will happen server-side
      const requestBody = {
        project_id: selectedProject.id,
        network_id: selectedNetwork.id,
        credentials: credentialsData,
        credential_name: formData.name || null
      };

      // Make POST request to create new credentials via local API
      const response = await fetch('/api/credentials/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create credentials: ${response.status}`);
      }

      // Show success message
      alert('Network credential created successfully!');
      
      // Redirect back to networks page
      const basePath = locale ? `/${locale}/dashboard/networks` : '/dashboard/networks';
      router.push(`${basePath}?refreshed=${Date.now()}`);
      
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create credential. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-xs">Loading networks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <p className="text-red-600 text-xs mb-4">{error}</p>
            <button 
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            >
              Back to Networks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pl-4 pr-4 pb-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold">Add Network Credential</h1>
            <p className="text-xs text-gray-500 mt-1">
              Select a network to add to your project
            </p>
          </div>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Networks
          </button>
        </div>

        {/* Main Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            {/* Network Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Network
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <input
                    type="text"
                    placeholder="Search networks..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      setSelectedNetwork(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredNetworks.length === 0 ? (
                      <div className="px-3 py-2 text-gray-500 text-xs">
                        No networks found
                      </div>
                    ) : (
                      filteredNetworks.map((network) => (
                        <button
                          key={network.id}
                          onClick={() => handleNetworkSelect(network)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-xs">{network.name}</div>
                          <div className="text-xs text-gray-500">ID: {network.id}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Choose a network to add to your project. You can search by network name.
              </p>
            </div>

            {/* Selected Network Display */}
            {selectedNetwork && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Selected Network
                </label>
                <div className="px-3 py-2 text-xs bg-green-50 border border-green-200 rounded-md text-green-800">
                  <div className="flex items-center gap-2">
                    <Network className="h-3 w-3" />
                    <span className="font-medium">{selectedNetwork.name}</span>
                  </div>
                  <div className="text-green-600 mt-1">
                    Network ID: {selectedNetwork.id}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {networks.length} networks available
                </p>
              </div>
            )}

            {/* Credential Name */}
            {selectedNetwork && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Credential Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a name for this credential"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This name helps you identify this credential in your dashboard. Especially if you run multiple accounts with the same network
                </p>
              </div>
            )}

            {/* Dynamic Fields from credential_schema */}
            {selectedNetwork && (() => {
              try {
                const credentialSchema = selectedNetwork.credential_schema;
                if (!credentialSchema || typeof credentialSchema !== 'object') return null;

                const fields: Record<string, { Type?: string; Label?: string; Information?: string; Value?: string }> = 
                  (credentialSchema as { Fields?: Record<string, { Type?: string; Label?: string; Information?: string; Value?: string }> }).Fields || {};

                return Object.entries(fields).map(([fieldKey, fieldConfig]) => {
                  const fieldType = fieldConfig.Type || 'string';
                  const fieldLabel = fieldConfig.Label || fieldKey;
                  const fieldInfo = fieldConfig.Information || '';

                  if (fieldType === 'select') {
                    // Handle select fields (like Country)
                    if (fieldKey.toLowerCase().includes('country')) {
                      return (
                        <div key={fieldKey}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {fieldLabel}
                          </label>
                          <CountrySelect
                            value={formData[fieldKey] || ''}
                            onValueChange={(value) => handleInputChange(fieldKey, value)}
                          />
                          {fieldInfo && (
                            <p className="text-xs text-gray-500 mt-1">{fieldInfo}</p>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div key={fieldKey}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {fieldLabel}
                          </label>
                          <select
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select {fieldLabel}</option>
                            {/* Options would be populated from API or field config */}
                          </select>
                          {fieldInfo && (
                            <p className="text-xs text-gray-500 mt-1">{fieldInfo}</p>
                          )}
                        </div>
                      );
                    }
                  } else {
                    // Handle text/string fields
                    const isPassword = fieldKey.toLowerCase().includes('password') || 
                                     fieldKey.toLowerCase().includes('token') ||
                                     fieldKey.toLowerCase().includes('secret');

                    return (
                      <div key={fieldKey}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {fieldLabel}
                        </label>
                        <input
                          type={isPassword ? 'password' : 'text'}
                          value={formData[fieldKey] || ''}
                          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                        />
                        {fieldInfo && (
                          <p className="text-xs text-gray-500 mt-1">{fieldInfo}</p>
                        )}
                      </div>
                    );
                  }
                });
              } catch (error) {
                console.error('Error rendering dynamic fields:', error);
                return null;
              }
            })()}

            {/* Network Count */}
            {!selectedNetwork && (
              <div className="text-xs text-gray-500">
                {networks.length} networks available
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end">
            <div className="flex gap-2">
              <button
                onClick={handleBack}
                disabled={saving}
                className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedNetwork || saving}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {saving ? 'Creating...' : 'Add Network'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
