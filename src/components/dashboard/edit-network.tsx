"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProjectNetworks, clearNetworksCache } from '../../hooks/use-project-networks';
import { Project } from '../../hooks/use-project-selection';
import { CountrySelect } from '../ui/country-select';

interface EditNetworkProps {
  locale?: string;
  selectedProject?: Project | null;
}

interface NetworkCredential {
  id: string;
  name: string;
  network_name: string;
  username: string;
  password: string;
  api_key?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

function EditNetworkContent({ locale, selectedProject }: EditNetworkProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const credentialId = searchParams.get('credential_id');
  
  // Get networks data for the selected project
  const { networks: networksData, isLoading: networksLoading, error: networksError, refreshNetworks } = useProjectNetworks(selectedProject?.id || null);
  
  const [credential, setCredential] = useState<NetworkCredential | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state - will be dynamic based on network credentials
  const [formData, setFormData] = useState<{ [key: string]: string }>({
    name: '',
  });
  
  // State for password visibility toggles
  const [passwordVisibility, setPasswordVisibility] = useState<{ [key: string]: boolean }>({});

  // Reset state when component mounts or credential ID changes
  useEffect(() => {
    setCredential(null);
    setError(null);
    setLoading(true);
    setSaving(false);
    setFormData({
      name: '',
    });
    setPasswordVisibility({});
  }, [credentialId]);

  // Function to decrypt credentials via API
  const decryptCredentials = useCallback(async (encryptedData: string): Promise<Record<string, string>> => {
    try {
      const response = await fetch('/api/decrypt-credentials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedCredentials: encryptedData
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to decrypt credentials');
      }

      return result.data || {};
    } catch (error) {
      console.error('Decryption error:', error);
      return {};
    }
  }, []);

  // Function to load and decrypt credential data
  const loadCredentialData = useCallback(async (
    networkData: {
      credential_id: string;
      credential_name?: string;
      credentials?: string;
    }, 
    credentialFields: Record<string, { Type?: string; Label?: string; Information?: string; Value?: string }>
  ) => {
    try {
      // Initialize form data with credential name
      const initialFormData: { [key: string]: string } = {
        name: networkData.credential_name || '',
      };

      // If we have encrypted credentials, decrypt them
      if (networkData.credentials) {
        console.log('Decrypting credentials for:', networkData.credential_id);
        const decryptedCredentials = await decryptCredentials(networkData.credentials);
        
        // Populate dynamic fields with decrypted values
        Object.keys(credentialFields).forEach(fieldKey => {
          initialFormData[fieldKey] = decryptedCredentials[fieldKey] || '';
        });
      } else {
        // No encrypted credentials, initialize empty
        Object.keys(credentialFields).forEach(fieldKey => {
          initialFormData[fieldKey] = '';
        });
      }

      setFormData(initialFormData);
      setLoading(false);

    } catch (error) {
      console.error('Error loading credential data:', error);
      setError(`Failed to load credential data: ${error}`);
      
      // Initialize form with empty values on error
      const initialFormData: { [key: string]: string } = {
        name: networkData?.credential_name || '',
      };

      Object.keys(credentialFields).forEach(fieldKey => {
        initialFormData[fieldKey] = '';
      });

      setFormData(initialFormData);
      setLoading(false);
    }
  }, [decryptCredentials, setFormData, setLoading, setError]);

  // Load and validate credential data
  useEffect(() => {
    if (!credentialId) {
      setError('No credential ID provided');
      setCredential(null);
      setLoading(false);
      return;
    }

    // Wait for project to be available
    if (!selectedProject) {
      setLoading(true);
      return;
    }

    // Wait for networks data to load
    if (networksLoading || !networksData) {
      setLoading(true);
      return;
    }

    // Check for networks loading error
    if (networksError) {
      setError(`Failed to load networks: ${networksError}`);
      setCredential(null);
      setLoading(false);
      return;
    }



    // Check the actual structure of networksData
    let userNetworks: Array<{
      credential_id: string
      network_id: number
      network_name: string
      updated_at: string
      error_message?: string | null
      credential_name?: string
      network_credentials?: string
      credentials?: string
    }> = [];

    if (networksData && typeof networksData === 'object') {
      if ('networks' in networksData && Array.isArray(networksData.networks)) {
        userNetworks = networksData.networks;
      } else if (Array.isArray(networksData)) {
        userNetworks = networksData;
      }
    }

    const networkData = userNetworks.find(n => n.credential_id === credentialId);

    if (!networkData) {
      setError('Access Denied - Credential not found in your networks');
      setCredential(null);
      setLoading(false);
      return;
    }

    // Parse network credentials structure
    let credentialFields: Record<string, { Type?: string; Label?: string; Information?: string; Value?: string }> = {};
    try {
      if (networkData.network_credentials) {
        const parsed = typeof networkData.network_credentials === 'string' 
          ? JSON.parse(networkData.network_credentials)
          : networkData.network_credentials;
        credentialFields = parsed.Fields || {};
      }
    } catch (error) {
      console.error('Error parsing network_credentials:', error);
    }

    // Create credential object from network data
    const validatedCredential: NetworkCredential = {
      id: networkData.credential_id,
      name: networkData.credential_name || `${networkData.network_name} Account`,
      network_name: networkData.network_name,
      username: 'demo_user@example.com', // Would come from API
      password: '••••••••••',
      api_key: 'api_key_••••••••',
      status: networkData.error_message ? 'inactive' as const : 'active' as const,
      created_at: '2024-01-15T10:30:00Z', // Would come from API
      updated_at: networkData.updated_at
    };

    setCredential(validatedCredential);

    // Decrypt and load credential data
    loadCredentialData(networkData, credentialFields);
  }, [credentialId, selectedProject, networksData, networksLoading, networksError, loadCredentialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: string) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const credentialId = searchParams.get('credential_id');
      
      if (!credentialId) {
        setError('No credential ID provided');
        return;
      }

      // Re-validate that the credential_id is still in the user's network list
      if (!selectedProject || networksLoading || !networksData) {
        setError('Project data not available');
        return;
      }

      let userNetworks: Array<{
        credential_id: string
        network_id: number
        network_name: string
        updated_at: string
        error_message?: string | null
        credential_name?: string
        network_credentials?: string
        credentials?: string
      }> = [];

      if (networksData && typeof networksData === 'object') {
        if ('networks' in networksData && Array.isArray(networksData.networks)) {
          userNetworks = networksData.networks;
        } else if (Array.isArray(networksData)) {
          userNetworks = networksData;
        }
      }

      const networkData = userNetworks.find(n => n.credential_id === credentialId);
      if (!networkData) {
        setError('Access Denied - Credential not found in your networks');
        return;
      }

      // Prepare credentials data for encryption (exclude name field)
      const credentialsData: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'name' && value) {
          credentialsData[key] = value;
        }
      });

      // Send unencrypted credentials data to server - encryption will happen server-side
      const requestBody = {
        credentials: credentialsData,
        credential_name: formData.name || null
      };

      // Make PUT request to update credentials via local API
      const response = await fetch(`/api/credentials/update?credential_id=${credentialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save credentials: ${response.status}`);
      }

      // Clear all networks cache to force reload
      clearNetworksCache();
      
      // Also try to refresh if available
      if (refreshNetworks) {
        await refreshNetworks();
      }
      
      // Small delay to ensure cache is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Show success message
      alert('Network credential updated successfully!');
      
      // Redirect back to networks page with refresh parameter and credential name
      const basePath = locale ? `/${locale}/dashboard/networks` : '/dashboard/networks';
      const encodedName = encodeURIComponent(formData.name || '');
      router.push(`${basePath}?refreshed=${Date.now()}&credentialId=${credentialId}&newName=${encodedName}`);
      
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const basePath = locale ? `/${locale}/dashboard/networks` : '/dashboard/networks';
    router.push(basePath);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this network credential? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (!credentialId) {
        throw new Error('Credential ID is required');
      }

      const response = await fetch('/api/credentials/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential_id: credentialId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete credential: ${response.status}`);
      }

      alert('Network credential deleted successfully!');
      handleCancel();
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete credential. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-xs">Loading network credential...</p>
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
              onClick={handleCancel}
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
            <h1 className="text-lg font-bold">Edit Network Credential</h1>
            <p className="text-xs text-gray-500 mt-1">
              Update your {credential?.network_name} account credentials
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Networks
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            {/* Credential Name */}
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

            {/* Network Info */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Network
              </label>
              <div className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                {credential?.network_name}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Network type cannot be changed after creation
              </p>
            </div>

            {/* Dynamic Fields from network_credentials */}
            {credential && (() => {
              try {
                // Get network data to access network_credentials
                const userNetworks = networksData && typeof networksData === 'object' && 'networks' in networksData && Array.isArray(networksData.networks)
                  ? networksData.networks
                  : [];
                
                const networkData = userNetworks.find((n: { credential_id: string; network_credentials?: string }) => n.credential_id === credential.id);
                const networkCredentials = networkData?.network_credentials;

                if (!networkCredentials) return null;

                const parsed = typeof networkCredentials === 'string' 
                  ? JSON.parse(networkCredentials)
                  : networkCredentials;

                const fields: Record<string, { Type?: string; Label?: string; Information?: string; Value?: string }> = parsed.Fields || {};

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
                        <div className="relative">
                          <input
                            type={isPassword && !passwordVisibility[fieldKey] ? 'password' : 'text'}
                            value={formData[fieldKey] || ''}
                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                            className="w-full px-3 py-2 pr-10 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                          />
                          {isPassword && (
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(fieldKey)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            >
                              {passwordVisibility[fieldKey] ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
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
          </div>

          {/* Credential Info */}
          {credential && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-xs font-medium text-gray-700 mb-2">Credential Information</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="font-mono text-gray-700">
                    {new Date(credential.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <div className="font-mono text-gray-700">
                    {new Date(credential.updated_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      credential.status === 'active' ? 'bg-green-100 text-green-800' :
                      credential.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {credential.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Credential ID:</span>
                  <div className="font-mono text-gray-700 text-xs">
                    {credential.id}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-md bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete Credential
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardEditNetwork({ locale, selectedProject }: EditNetworkProps) {
  return (
    <Suspense fallback={
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-xs">Loading edit form...</p>
          </div>
        </div>
      </div>
    }>
      <EditNetworkContent locale={locale} selectedProject={selectedProject} />
    </Suspense>
  );
}
