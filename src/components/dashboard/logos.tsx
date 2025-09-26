"use client";

import React, { useState, useRef } from 'react';
import { ImageIcon, AlertCircle, Download } from 'lucide-react';
import Image from 'next/image';

interface LogoResult {
  url: string;
  logo: string;
}

interface LogoSettings {
  width: number;
  height: number;
}

export default function DashboardLogos() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LogoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    width: 128,
    height: 128
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const downloadImage = (format: 'png' | 'jpg' | 'webp') => {
    if (!result) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = logoSettings.width;
    canvas.height = logoSettings.height;

    // Clear canvas with white background for JPG
    if (format === 'jpg') {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const img = new window.Image();
    img.onload = () => {
      // Calculate dimensions without stretching
      const scale = Math.min(
        logoSettings.width / img.naturalWidth,
        logoSettings.height / img.naturalHeight,
        1 // Never scale up beyond original size
      );
      
      const scaledWidth = img.naturalWidth * scale;
      const scaledHeight = img.naturalHeight * scale;
      
      // Center the image
      const x = (logoSettings.width - scaledWidth) / 2;
      const y = (logoSettings.height - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Convert to desired format and download
      const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
      const quality = format === 'jpg' ? 0.9 : undefined;
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `logo-${logoSettings.width}x${logoSettings.height}.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, mimeType, quality);
    };
    
    img.crossOrigin = 'anonymous';
    img.src = result.logo;
  };

  return (
    <div className="pt-4 pl-4 pr-4 pb-6">
      <div className="space-y-3">
        {/* Header */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-blue-100 rounded">
              <ImageIcon className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-gray-900">Logo Extractor</h1>
              <p className="text-xs text-gray-600">Extract logos from websites by entering their URL</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="url" className="block text-xs font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              {url && !isValidUrl(url) && (
                <p className="text-xs text-red-600 mt-1">
                  Please enter a valid URL
                </p>
              )}
            </div>

            {/* Logo Size Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="width" className="block text-xs font-medium text-gray-700 mb-1">
                  Width (px)
                </label>
                <input
                  id="width"
                  type="number"
                  min="16"
                  max="512"
                  value={logoSettings.width}
                  onChange={(e) => setLogoSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 128 }))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="height" className="block text-xs font-medium text-gray-700 mb-1">
                  Height (px)
                </label>
                <input
                  id="height"
                  type="number"
                  min="16"
                  max="512"
                  value={logoSettings.height}
                  onChange={(e) => setLogoSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 128 }))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit" 
              disabled={isLoading || !url.trim() || !isValidUrl(url)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Fetching Logo...
                </>
              ) : (
                <>
                  <ImageIcon className="w-3 h-3" />
                  Fetch Logo
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <AlertCircle className="h-3 w-3 mx-auto mb-1" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-3">
              Extracted Logo
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <p className="text-xs text-gray-600 break-all">
                  {result.url}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Logo Preview ({logoSettings.width}x{logoSettings.height}px)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="flex-shrink-0">
                    <div 
                      className="border border-gray-200 rounded-lg bg-white p-2 flex items-center justify-center overflow-hidden"
                      style={{ 
                        width: `${logoSettings.width + 16}px`, 
                        height: `${logoSettings.height + 16}px` 
                      }}
                    >
                      <div
                        className="relative overflow-hidden flex items-center justify-center"
                        style={{ 
                          width: `${logoSettings.width}px`, 
                          height: `${logoSettings.height}px` 
                        }}
                      >
                        <Image
                          src={result.logo}
                          alt={`Logo for ${result.url}`}
                          width={logoSettings.width}
                          height={logoSettings.height}
                          className="object-contain max-w-full max-h-full"
                          style={{
                            maxWidth: `${logoSettings.width}px`,
                            maxHeight: `${logoSettings.height}px`,
                            width: 'auto',
                            height: 'auto'
                          }}
                          unoptimized
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-2">
                      Base64 Data (click to copy):
                    </p>
                    <div 
                      className="bg-gray-50 p-2 rounded border cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(result.logo);
                        // Could add a toast notification here
                      }}
                    >
                      <code className="text-xs break-all text-gray-700">
                        {result.logo.length > 100 
                          ? `${result.logo.substring(0, 100)}...` 
                          : result.logo
                        }
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Section */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Download Logo
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadImage('png')}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors duration-200 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    PNG
                  </button>
                  <button
                    onClick={() => downloadImage('jpg')}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors duration-200 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    JPG
                  </button>
                  <button
                    onClick={() => downloadImage('webp')}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md transition-colors duration-200 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    WebP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
