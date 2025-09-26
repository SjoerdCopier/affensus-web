"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface LogoResult {
  url: string;
  logo: string;
}

export default function DashboardLogos() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LogoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch logo');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logo Fetcher</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Extract logos from websites by entering their URL.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fetch Website Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL
              </label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
              {url && !isValidUrl(url) && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Please enter a valid URL
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !url.trim() || !isValidUrl(url)}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Fetching Logo...' : 'Fetch Logo'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Logo Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website URL
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                  {result.url}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0">
                    <img
                      src={result.logo}
                      alt={`Logo for ${result.url}`}
                      className="max-w-32 max-h-32 object-contain border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Base64 Data (click to copy):
                    </p>
                    <div 
                      className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(result.logo);
                        // Could add a toast notification here
                      }}
                    >
                      <code className="text-xs break-all text-gray-700 dark:text-gray-300">
                        {result.logo.length > 100 
                          ? `${result.logo.substring(0, 100)}...` 
                          : result.logo
                        }
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
