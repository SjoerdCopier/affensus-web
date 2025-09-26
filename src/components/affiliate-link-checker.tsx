"use client"; // This marks the file as a client component

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Breadcrumbs from "@/components/breadcrumbs";
import { useLocaleTranslations } from "@/hooks/use-locale-translations";
import { useUser } from "@/hooks/use-user";
import { Shield, Search, Clock, Globe, ChevronDown, ChevronUp, Copy, Check, Flag, AlertTriangle } from 'lucide-react';
import { CountrySelect } from "@/components/ui/country-select";

interface Flag {
    name: string;
    flag_type: string;
    description: string;
    severity: string;
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
}

// ApiRedirectStep interface removed - using main Redirect interface

// Helper function to extract domain from URL
const extractDomain = (url: string): string => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return url;
    }
};

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

function AffiliateLinkCheckerContent() {
    const { t } = useLocaleTranslations();
    const router = useRouter();
    const { user } = useUser();
    const searchParams = useSearchParams();
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
    const [proxyCountry, setProxyCountry] = useState("");
    const [checkUuid, setCheckUuid] = useState("");
    const [isSharedResult, setIsSharedResult] = useState(false);
    const [expandedUrls, setExpandedUrls] = useState<Set<number>>(new Set());
    const [copiedUrls, setCopiedUrls] = useState<Set<number>>(new Set());

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

    // Function to load shared results
    const loadSharedResult = useCallback(async (uuid: string) => {
        setLoading(true);
        setRedirects([]);
        setResultMessage("");
        setHas404(false);
        setMultipleNetworks(false);
        setHasRedirectError(false);

        try {
            const apiEndpoint = process.env.NODE_ENV === 'development' 
                ? `http://localhost:8788/api/tools/affiliate-link-checker?uuid=${uuid}`
                : `/api/tools/affiliate-link-checker?uuid=${uuid}`;

            const response = await fetch(apiEndpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const responseData = await response.json();
                let redirects: Redirect[] = [];
                let has404 = false;
                let hasRedirectError = false;
                let uniqueNetworks: string[] = [];

                if (responseData.success) {
                    const data = responseData.data || responseData;
                    redirects = data.redirect_chain || [];
                    
                    setRedirects(redirects);
                    setCheckUuid(data.uuid || uuid);
                    setAffiliateUrl(data.original_url || ""); // Set the original URL if available
                    setIsSharedResult(true); // Mark this as a shared result
                    
                    // Don't make any additional API calls - just use the existing data

                    // Check for 404 status code
                    has404 = redirects.some((redirect: Redirect) => redirect.status_code === 404);
                    setHas404(has404);

                    // Check for redirect errors (4xx or 5xx status codes)
                    hasRedirectError = redirects.some((redirect: Redirect) => redirect.status_code >= 400);
                    setHasRedirectError(hasRedirectError);

                    // Check for multiple different network names
                    uniqueNetworks = [...new Set(redirects.map((redirect: Redirect) => redirect.affiliate_network?.name).filter((name): name is string => Boolean(name)))];
                    setMultipleNetworks(uniqueNetworks.length > 1);
                } else {
                    // Handle API error response - but still try to extract redirect chain if available
                    console.error('API returned error for shared result:', responseData.error);
                    
                    // Even on error, try to extract redirect chain if it exists
                    if (responseData.redirect_chain && responseData.redirect_chain.length > 0) {
                        redirects = responseData.redirect_chain;
                        setRedirects(redirects);
                        setCheckUuid(responseData.uuid || uuid);
                        setAffiliateUrl(responseData.original_url || ""); // Set the original URL if available
                        setIsSharedResult(true); // Mark this as a shared result
                        
                        // Check for 404 status code
                        has404 = redirects.some((redirect: Redirect) => redirect.status_code === 404);
                        setHas404(has404);

                        // Check for redirect errors (4xx or 5xx status codes)
                        hasRedirectError = redirects.some((redirect: Redirect) => redirect.status_code >= 400);
                        setHasRedirectError(hasRedirectError);

                        // Check for multiple different network names
                        uniqueNetworks = [...new Set(redirects.map((redirect: Redirect) => redirect.affiliate_network?.name).filter((name): name is string => Boolean(name)))];
                        setMultipleNetworks(uniqueNetworks.length > 1);
                    }
                }

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
                } else if (!responseData.success) {
                    // Set error message for API error
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
                console.error('Error fetching shared result');
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
            }
        } catch (error) {
            console.error('Error loading shared result:', error);
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
    }, [t]);

    // Check for share parameter on component mount
    useEffect(() => {
        const shareUuid = searchParams.get('share');
        if (shareUuid && !isSharedResult && redirects.length === 0) {
            loadSharedResult(shareUuid);
        }
    }, [searchParams, loadSharedResult, isSharedResult, redirects.length]);

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
        
        // Check if user is trying to use proxy without being logged in
        if (proxyCountry && !user) {
            router.push('/auth');
            return;
        }
        
        setLoading(true);
        setRedirects([]);
        setResultMessage("");
        setHas404(false);
        setMultipleNetworks(false);
        setHasRedirectError(false); // Reset the error state
        setCheckUuid(""); // Reset the UUID
        setIsSharedResult(false); // Reset shared result flag

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
                body: JSON.stringify({ 
                    url: affiliateUrl,
                    ...(proxyCountry && {
                        proxy: true,
                        country: proxyCountry
                    })
                }),
            });

            // Try to parse response regardless of status code
            let responseData;
            try {
                responseData = await response.json();
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                throw new Error('Invalid response format');
            }

            let redirects: Redirect[] = [];
            let has404 = false;
            let hasRedirectError = false;
            let uniqueNetworks: string[] = [];
            
            // Handle the response data regardless of success status
            if (responseData.success) {
                // The actual data is in responseData (or responseData.data if nested)
                const data = responseData.data || responseData;
                redirects = data.redirect_chain || [];
                
                setRedirects(redirects); // Store all redirects
                setCheckUuid(data.uuid || ""); // Store the UUID from API

                // Check for 404 status code
                has404 = redirects.some((redirect: Redirect) => redirect.status_code === 404);
                setHas404(has404);

                // Check for redirect errors (4xx or 5xx status codes)
                hasRedirectError = redirects.some((redirect: Redirect) => redirect.status_code >= 400);
                setHasRedirectError(hasRedirectError);

                // Check for multiple different network names
                uniqueNetworks = [...new Set(redirects.map((redirect: Redirect) => redirect.affiliate_network?.name).filter((name): name is string => Boolean(name)))];
                setMultipleNetworks(uniqueNetworks.length > 1);
            } else {
                // Handle API error response - but still try to extract redirect chain if available
                console.error('API returned error:', responseData.error);
                
                // Even on error, try to extract redirect chain if it exists
                if (responseData.redirect_chain && responseData.redirect_chain.length > 0) {
                    redirects = responseData.redirect_chain;
                    setRedirects(redirects);
                    setCheckUuid(responseData.uuid || "");
                    
                    // Check for 404 status code
                    has404 = redirects.some((redirect: Redirect) => redirect.status_code === 404);
                    setHas404(has404);

                    // Check for redirect errors (4xx or 5xx status codes)
                    hasRedirectError = redirects.some((redirect: Redirect) => redirect.status_code >= 400);
                    setHasRedirectError(hasRedirectError);

                    // Check for multiple different network names
                    uniqueNetworks = [...new Set(redirects.map((redirect: Redirect) => redirect.affiliate_network?.name).filter((name): name is string => Boolean(name)))];
                    setMultipleNetworks(uniqueNetworks.length > 1);
                }
            }

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
            } else if (!responseData.success) {
                // Set error message for API error
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
                    
                    {/* Proxy */}
                    <div className="mb-4">
                        <label htmlFor="proxy-country" className="block text-sm font-medium text-gray-700 mb-1">
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
                        {/* Redirect Chain Analysis Header */}
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirect Chain Analysis</h2>
                            <div className="text-gray-600">
                                {redirects.length} steps • Total time: {redirects.reduce((total, redirect) => total + (redirect.latency_ms || 0), 0).toFixed(2)}ms
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Final destination: {redirects.length > 0 ? truncateUrl(redirects[redirects.length - 1].url, 60) : 'N/A'}
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-700">{t('tools.affiliateLinkChecker.results.redirects')}</h3>
                        <ul className="mt-4 space-y-2">
                            {redirects.map((redirect: Redirect, index: number) => {
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
                                        {/* Network badge */}
                                        <span className="inline-flex items-center justify-center rounded-md border border-gray-300 px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground text-xs">
                                            <Globe className="w-3 h-3 mr-1" aria-hidden="true" />
                                            {redirect.affiliate_network?.name || 'Unknown'}
                                        </span>
                                        
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
                                        {redirects.length}
                                    </div>
                                    <div className="text-sm text-black">Total Redirects</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-black">
                                        {redirects.reduce((total, redirect) => total + (redirect.latency_ms || 0), 0).toFixed(1)}ms
                                    </div>
                                    <div className="text-sm text-black">Total Time</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-black">
                                        {redirects.length > 0 
                                            ? (redirects.reduce((total, redirect) => total + (redirect.latency_ms || 0), 0) / redirects.length).toFixed(0) + 'ms'
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
                                    <span className="text-gray-600">{redirects.length}</span>
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
                                        setAffiliateUrl('');
                                        setProxyCountry('');
                                        setRedirects([]);
                                        setResultMessage('');
                                        setHas404(false);
                                        setMultipleNetworks(false);
                                        setHasRedirectError(false);
                                        setCheckUuid("");
                                        setIsSharedResult(false);
                                    }}
                                    className="bg-[#6ca979] hover:bg-[#5a8a66] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                                >
                                    Check another URL
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        // Remove networkId from the data
                                        const cleanedRedirects = redirects.map(redirect => {
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
${redirects.map(redirect => `  <redirect>
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
                                
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        if (!checkUuid) return;
                                        
                                        const shareUrl = `${window.location.origin}/tools/affiliate-link-checker?share=${checkUuid}`;
                                        navigator.clipboard.writeText(shareUrl).then(() => {
                                            // Visual feedback
                                            const button = e.target as HTMLButtonElement;
                                            const originalText = button.textContent;
                                            button.textContent = 'Link Copied!';
                                            button.classList.add('bg-green-600');
                                            button.classList.remove('bg-blue-600');
                                            setTimeout(() => {
                                                button.textContent = originalText;
                                                button.classList.remove('bg-green-600');
                                                button.classList.add('bg-blue-600');
                                            }, 1500);
                                        }).catch(err => {
                                            console.error('Failed to copy share URL:', err);
                                        });
                                    }}
                                    disabled={!checkUuid}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                                >
                                    Share
                                </button>
                            </div>
                        </div>
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
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6ca979]"></div>
        </div>}>
            <AffiliateLinkCheckerContent />
        </Suspense>
    );
}
