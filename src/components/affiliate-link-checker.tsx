"use client"; // This marks the file as a client component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from "@/components/breadcrumbs";
import { useLocaleTranslations } from "@/hooks/use-locale-translations";
import { Shield, Search, Clock } from 'lucide-react';

interface Redirect {
    url: string;
    status: number | string;
    type: string;
    name?: string;
    error?: string;
}

function AffiliateLinkCheckerContent() {
    const { t } = useLocaleTranslations();
    const router = useRouter();
    const [affiliateUrl, setAffiliateUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [redirects, setRedirects] = useState<Redirect[]>([]);
    const [resultMessage, setResultMessage] = useState<React.ReactNode>("");
    const [has404, setHas404] = useState(false);
    const [multipleNetworks, setMultipleNetworks] = useState(false);
    const [hasRedirectError, setHasRedirectError] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [bulkUrls, setBulkUrls] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const extractUrlsFromText = (text: string): string[] => {
        // Extract URLs from plain text
        const urlRegex = /https?:\/\/[^\s\n\r,]+/g;
        return text.match(urlRegex) || [];
    };

    const extractUrlsFromJson = (jsonContent: string): string[] => {
        try {
            const data = JSON.parse(jsonContent);
            const urls: string[] = [];
            
            const extractFromObject = (obj: unknown) => {
                if (typeof obj === 'string' && obj.match(/^https?:\/\//)) {
                    urls.push(obj);
                } else if (Array.isArray(obj)) {
                    obj.forEach(extractFromObject);
                } else if (typeof obj === 'object' && obj !== null) {
                    Object.values(obj).forEach(extractFromObject);
                }
            };
            
            extractFromObject(data);
            return urls;
        } catch {
            // If JSON parsing fails, fall back to text extraction
            return extractUrlsFromText(jsonContent);
        }
    };

    const extractUrlsFromXml = (xmlContent: string): string[] => {
        const urlRegex = /https?:\/\/[^<>\s]+/g;
        const matches = xmlContent.match(urlRegex);
        return matches || [];
    };

    const handleFileUpload = async (file: File): Promise<string[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                let urls: string[] = [];
                
                if (file.type === 'application/json' || file.name.endsWith('.json')) {
                    urls = extractUrlsFromJson(content);
                } else if (file.type === 'application/xml' || file.type === 'text/xml' || file.name.endsWith('.xml')) {
                    urls = extractUrlsFromXml(content);
                } else {
                    urls = extractUrlsFromText(content);
                }
                
                resolve(urls);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    };

    const handleAdvancedSubmit = async () => {
        let urlsToProcess: string[] = [];
        
        if (uploadedFile) {
            try {
                urlsToProcess = await handleFileUpload(uploadedFile);
            } catch (error) {
                console.error('Error processing file:', error);
                return;
            }
        } else if (bulkUrls.trim()) {
            urlsToProcess = extractUrlsFromText(bulkUrls);
        }
        
        if (urlsToProcess.length === 0) {
            return;
        }
        
        // For bulk processing, redirect to auth page
        // Store the URLs in sessionStorage for after auth
        sessionStorage.setItem('bulkUrls', JSON.stringify(urlsToProcess));
        router.push('/auth');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setRedirects([]);
        setResultMessage("");
        setHas404(false);
        setMultipleNetworks(false);
        setHasRedirectError(false); // Reset the error state

        try {
            // Use the Cloudflare Pages function endpoint
            // In development with Wrangler, this will be the local endpoint
            // In production, this will be the deployed Cloudflare Pages function
            const apiEndpoint = process.env.NODE_ENV === 'development' 
                ? 'http://localhost:8788/api/tools/affiliate-link-checker'
                : '/api/tools/affiliate-link-checker';
                
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: affiliateUrl }),
            });

            if (response.ok) {
                const data = await response.json();
                setRedirects(data.redirects); // Store all redirects

                // Check for 404 status code
                const has404 = data.redirects.some((redirect: Redirect) => redirect.status === 404);
                setHas404(has404);

                // Check for redirect errors
                const hasRedirectError = data.redirects.some((redirect: Redirect) => redirect.status === 'error');
                setHasRedirectError(hasRedirectError);

                // Check for multiple different network names
                const uniqueNetworks = [...new Set(data.redirects.map((redirect: Redirect) => redirect.name).filter(Boolean))];
                setMultipleNetworks(uniqueNetworks.length > 1);

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
                } else if (uniqueNetworks.length > 1) {
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

            } else {
                console.error('Error fetching the URL redirects');
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
            setLoading(false);
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
                                label: "Affiliate Link Checker",
                                href: "/tools/affiliate-link-checker",
                                current: true,
                            },
                        ]}
                    />
                </div>
                
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {t('tools.affiliateLinkChecker.title')}
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                    {t('tools.affiliateLinkChecker.description')}
                </p>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-3 gap-6 my-12">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 rounded-full bg-[#6ca979]">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Link Validation</h3>
                        <p className="text-sm text-gray-600">Verify your affiliate links are working correctly</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 rounded-full bg-[#6ca979]">
                            <Search className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Network Detection</h3>
                        <p className="text-sm text-gray-600">Identify which affiliate network your links belong to</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 rounded-full bg-[#6ca979]">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Instant Analysis</h3>
                        <p className="text-sm text-gray-600">Get immediate feedback on link status and redirects</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="affiliate-url" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('tools.affiliateLinkChecker.form.label')}
                        </label>
                        <input
                            type="url"
                            id="affiliate-url"
                            value={affiliateUrl}
                            onChange={(e) => setAffiliateUrl(e.target.value)}
                            required
                            placeholder={t('tools.affiliateLinkChecker.form.placeholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button 
                            type="submit"
                            className="bg-[#6ca979] text-white px-6 py-2 rounded-md hover:bg-[#5a8a66] transition-colors cursor-pointer"
                        >
                            {t('tools.affiliateLinkChecker.form.button')}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                            Advanced
                        </button>
                    </div>
                </form>

                {showAdvanced && (
                    <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload File (JSON, XML, or TXT)
                                </label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept=".json,.xml,.txt"
                                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {uploadedFile && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        Selected: {uploadedFile.name}
                                    </p>
                                )}
                            </div>

                            <div className="text-center text-gray-500 text-sm">
                                OR
                            </div>

                            <div>
                                <label htmlFor="bulk-urls" className="block text-sm font-medium text-gray-700 mb-2">
                                    Paste URLs (one per line)
                                </label>
                                <textarea
                                    id="bulk-urls"
                                    value={bulkUrls}
                                    onChange={(e) => setBulkUrls(e.target.value)}
                                    placeholder="https://example.com/affiliate-link-1&#10;https://example.com/affiliate-link-2&#10;https://example.com/affiliate-link-3"
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleAdvancedSubmit}
                                disabled={!uploadedFile && !bulkUrls.trim()}
                                className="w-full bg-[#6ca979] text-white px-6 py-2 rounded-md hover:bg-[#5a8a66] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Process Multiple URLs
                            </button>
                        </div>
                    </div>
                )}
                
                {loading && (
                    <div className="mt-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6ca979]"></div>
                        <p className="mt-2 text-gray-600">{t('tools.affiliateLinkChecker.loading')}</p>
                    </div>
                )}
                
                {resultMessage && (
                    <div className={`mt-6 p-4 border rounded-md flex items-start ${has404 || hasRedirectError ? 'bg-red-100 text-red-700 border-red-300' : multipleNetworks ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-green-100 text-green-700 border-green-300'}`}>
                        {resultMessage}
                    </div>
                )}
                
                {redirects.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold">{t('tools.affiliateLinkChecker.results.redirects')}</h2>
                        <ul className="mt-4 space-y-2">
                            {redirects.map((redirect: Redirect, index: number) => (
                                <li key={index} className="p-4 border border-gray-200 rounded-md">
                                    <div className="text-sm text-gray-500">{t('tools.affiliateLinkChecker.results.redirectNumber').replace('{number}', String(index + 1))}</div>
                                    <div className="text-lg text-gray-900 truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {redirect.url.length > 55 ? `${redirect.url.substring(0, 55)}...` : redirect.url}
                                    </div>
                                    {redirect.name && (
                                        <div className="text-sm font-medium text-blue-500">
                                            {t('tools.affiliateLinkChecker.results.network')} {redirect.name}
                                        </div>
                                    )}
                                    <div className={`text-sm font-medium ${typeof redirect.status === 'number' && redirect.status < 300 ? 'text-green-500' : 'text-red-500'}`}>
                                        {t('tools.affiliateLinkChecker.results.status')} {redirect.status} ({redirect.type})
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                <section>
                   <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.affiliateLinkChecker.sections.about.multipleUrls.question')}</h2>
                            <p className="text-gray-700">
                                {t('tools.affiliateLinkChecker.sections.about.multipleUrls.answer')}
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.affiliateLinkChecker.sections.whatIs.title')}</h2>
                    <p className="text-gray-700 leading-relaxed">
                        {t('tools.affiliateLinkChecker.sections.whatIs.description')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.affiliateLinkChecker.sections.howItWorks.title')}</h2>
                    <p className="text-gray-700 leading-relaxed">
                        {t('tools.affiliateLinkChecker.sections.howItWorks.description')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.affiliateLinkChecker.sections.differentNetwork.title')}</h2>
                    <p className="text-gray-700 leading-relaxed">
                        {t('tools.affiliateLinkChecker.sections.differentNetwork.description')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.affiliateLinkChecker.sections.programLeasing.title')}</h2>
                    <p className="text-gray-700 leading-relaxed">
                        {t('tools.affiliateLinkChecker.sections.programLeasing.description')}
                    </p>
                </section>
                </div>
                </div>
            </main>
        </div>
    );
}

export default function AffiliateLinkChecker() {
    return <AffiliateLinkCheckerContent />;
}
