"use client";

import React, { useState, useRef } from 'react';
import { ImageIcon, AlertCircle, Download, Shield, Search, Clock, Code, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from "@/components/breadcrumbs";
import { useLocaleTranslations } from "@/hooks/use-locale-translations";

interface LogoResult {
  url: string;
  logo: string;
}

interface LogoSettings {
  width: number;
  height: number;
}

export default function FreeLogoApi() {
  const { t } = useLocaleTranslations();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LogoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    width: 128,
    height: 128
  });
  const [activeTab, setActiveTab] = useState<'python' | 'curl' | 'php'>('python');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
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

  const copyToClipboard = async (code: string, codeType: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(codeType);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getCodeExample = (language: 'python' | 'curl' | 'php') => {
    const apiEndpoint = 'https://apiv2.affensus.com/api/get-logos';
    
    switch (language) {
      case 'python':
        return `import requests
import json

# Get your API key by signing up at https://affensus.com/auth
api_key = "YOUR_API_KEY"
url = "https://example.com"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "url": url
}

response = requests.post("${apiEndpoint}", 
                        headers=headers, 
                        json=data)

if response.status_code == 200:
    result = response.json()
    if result["success"]:
        logo_data = result["data"]["logo"]
        print(f"Logo extracted: {logo_data[:50]}...")
    else:
        print(f"Error: {result['error']}")
else:
    print(f"HTTP Error: {response.status_code}")`;

      case 'curl':
        return `# Get your API key by signing up at https://affensus.com/auth
curl -X POST "${apiEndpoint}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com"
  }'`;

      case 'php':
        return `<?php
// Get your API key by signing up at https://affensus.com/auth
$api_key = "YOUR_API_KEY";
$url = "https://example.com";

$data = json_encode([
    "url" => $url
]);

$options = [
    'http' => [
        'header' => [
            "Authorization: Bearer " . $api_key,
            "Content-Type: application/json"
        ],
        'method' => 'POST',
        'content' => $data
    ]
];

$context = stream_context_create($options);
$response = file_get_contents("${apiEndpoint}", false, $context);

if ($response !== FALSE) {
    $result = json_decode($response, true);
    if ($result['success']) {
        $logo_data = $result['data']['logo'];
        echo "Logo extracted: " . substr($logo_data, 0, 50) . "...\\n";
    } else {
        echo "Error: " . $result['error'] . "\\n";
    }
} else {
    echo "HTTP Error occurred\\n";
}
?>`;

      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
                label: "Free Logo API",
                href: "/tools/free-logo-api",
                current: true,
              },
            ]}
          />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('tools.freeLogoApi.title')}
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {t('tools.freeLogoApi.description')}
            </p>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 my-12">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-[#6ca979]">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">High Quality</h3>
                <p className="text-sm text-gray-600">Extract logos in original quality without compression</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-[#6ca979]">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Multiple Formats</h3>
                <p className="text-sm text-gray-600">Download in PNG, JPG, or WebP with custom dimensions</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-[#6ca979]">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Instant Results</h3>
                <p className="text-sm text-gray-600">Get logos immediately with our fast extraction API</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="website-url" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('tools.freeLogoApi.form.label')}
                </label>
                <input
                  type="url"
                  id="website-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  placeholder={t('tools.freeLogoApi.form.placeholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {url && !isValidUrl(url) && (
                  <p className="text-xs text-red-600 mt-1">
                    {t('tools.freeLogoApi.messages.invalidUrl')}
                  </p>
                )}
              </div>

              {/* Logo Size Settings */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                    Width (px)
                  </label>
                  <input
                    id="width"
                    type="number"
                    min="16"
                    max="512"
                    value={logoSettings.width}
                    onChange={(e) => setLogoSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 128 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                    Height (px)
                  </label>
                  <input
                    id="height"
                    type="number"
                    min="16"
                    max="512"
                    value={logoSettings.height}
                    onChange={(e) => setLogoSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 128 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit" 
                disabled={isLoading || !url.trim() || !isValidUrl(url)}
                className="bg-[#6ca979] text-white px-6 py-2 rounded-md hover:bg-[#5a8a66] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('tools.freeLogoApi.loading')}
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    {t('tools.freeLogoApi.form.button')}
                  </>
                )}
              </button>
            </form>
            
            {/* Loading State */}
            {isLoading && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6ca979]"></div>
                <p className="mt-2 text-gray-600">{t('tools.freeLogoApi.loading')}</p>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="mt-6 space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-green-500 mr-3 mt-0.5"
                  >
                    <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"></path>
                  </svg>
                  <div>
                    <p className="text-green-700 font-medium">{t('tools.freeLogoApi.results.success')}</p>
                    <p className="text-green-600 text-sm">{t('tools.freeLogoApi.results.successDescription')}</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Extracted Logo</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website URL
                      </label>
                      <p className="text-sm text-gray-600 break-all">
                        {result.url}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Preview ({logoSettings.width}x{logoSettings.height}px)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="flex-shrink-0">
                          <div 
                            className="border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-center overflow-hidden"
                            style={{ 
                              width: `${logoSettings.width + 32}px`, 
                              height: `${logoSettings.height + 32}px` 
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
                          <p className="text-sm text-gray-500 mb-2">
                            Base64 Data (click to copy):
                          </p>
                          <div 
                            className="bg-white p-3 rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(result.logo);
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
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Download Logo
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => downloadImage('png')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          PNG
                        </button>
                        <button
                          onClick={() => downloadImage('jpg')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          JPG
                        </button>
                        <button
                          onClick={() => downloadImage('webp')}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          WebP
                        </button>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setUrl('');
                          setResult(null);
                          setError(null);
                          setLogoSettings({ width: 128, height: 128 });
                        }}
                        className="bg-[#6ca979] hover:bg-[#5a8a66] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Extract Another Logo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.freeLogoApi.sections.whatIs.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('tools.freeLogoApi.sections.whatIs.description')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.freeLogoApi.sections.howItWorks.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('tools.freeLogoApi.sections.howItWorks.description')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.freeLogoApi.sections.supportedFormats.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('tools.freeLogoApi.sections.supportedFormats.description')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.freeLogoApi.sections.useCases.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('tools.freeLogoApi.sections.useCases.description')}
              </p>
            </section>

            {/* API Playground Section */}
            <section>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6 overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Code className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900">{t('tools.freeLogoApi.sections.apiPlayground.title')}</h2>
                    <p className="text-sm text-gray-600">{t('tools.freeLogoApi.sections.apiPlayground.subtitle')}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-4 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">{t('tools.freeLogoApi.sections.apiPlayground.endpoint')}</span>
                    </div>
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono break-all">POST https://apiv2.affensus.com/api/get-logos</code>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-yellow-800 font-medium">{t('tools.freeLogoApi.sections.apiPlayground.apiKeyRequired')}</p>
                        <p className="text-yellow-700">
                          {t('tools.freeLogoApi.sections.apiPlayground.apiKeyDescription')}
                        </p>
                        <Link 
                          href="/auth" 
                          className="inline-block mt-2 px-3 py-1 bg-yellow-600 text-white text-xs font-medium rounded hover:bg-yellow-700 transition-colors"
                        >
                          {t('tools.freeLogoApi.sections.apiPlayground.getApiKey')}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Code Examples Tabs */}
                  <div className="border-b border-gray-200 mb-4">
                    <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
                      {(['python', 'curl', 'php'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setActiveTab(lang)}
                          className={`py-2 px-3 sm:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                            activeTab === lang
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Code Block */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {activeTab} {t('tools.freeLogoApi.sections.apiPlayground.example')}
                      </span>
                      <button
                        onClick={() => copyToClipboard(getCodeExample(activeTab), activeTab)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {copiedCode === activeTab ? (
                          <>
                            <Check className="h-3 w-3" />
                            {t('tools.freeLogoApi.sections.apiPlayground.copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            {t('tools.freeLogoApi.sections.apiPlayground.copy')}
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm max-w-full">
                      <code className="whitespace-pre-wrap break-words sm:whitespace-pre">{getCodeExample(activeTab)}</code>
                    </pre>
                  </div>

                  {/* API Response Example */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">{t('tools.freeLogoApi.sections.apiPlayground.expectedResponse')}</h3>
                    <pre className="bg-gray-50 border rounded-lg p-4 overflow-x-auto text-sm max-w-full">
                      <code className="whitespace-pre-wrap break-words sm:whitespace-pre">{`{
  "success": true,
  "data": {
    "url": "https://example.com",
    "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}`}</code>
                    </pre>
                  </div>

                  {/* Rate Limits */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">{t('tools.freeLogoApi.sections.apiPlayground.rateLimits')}</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• {t('tools.freeLogoApi.sections.apiPlayground.rateLimitsList.freeTier')}</li>
                      <li>• {t('tools.freeLogoApi.sections.apiPlayground.rateLimitsList.premium')}</li>
                      <li>• {t('tools.freeLogoApi.sections.apiPlayground.rateLimitsList.responseFormat')}</li>
                      <li>• {t('tools.freeLogoApi.sections.apiPlayground.rateLimitsList.supportedFormats')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
