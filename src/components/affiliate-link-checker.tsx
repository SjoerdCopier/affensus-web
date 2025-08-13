"use client"; // This marks the file as a client component

import React, { useState } from 'react';
import Breadcrumbs from "@/components/breadcrumbs";

interface Redirect {
    url: string;
    status: number | string;
    type: string;
    name?: string;
    error?: string;
}

function AffiliateLinkCheckerContent() {
    const [affiliateUrl, setAffiliateUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [redirects, setRedirects] = useState<Redirect[]>([]);
    const [resultMessage, setResultMessage] = useState<React.ReactNode>("");
    const [has404, setHas404] = useState(false);
    const [multipleNetworks, setMultipleNetworks] = useState(false);
    const [hasRedirectError, setHasRedirectError] = useState(false);

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
                                We&apos;ve detected a dead end in one of the redirects. It&apos;s likely that this affiliate link is no longer working. Log in to promote this advertiser via a different network.
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
                                We&apos;ve detected a 404 dead link in one of the redirects. It&apos;s likely that this affiliate link is no longer working. Log in to promote this advertiser via a different network.
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
                                We&apos;ve identified multiple affiliate networks associated with this link. You may be eligible to run this program through a different network instead of <b>{firstNetwork}</b>. Log in to explore this opportunity and apply to their campaign.
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
                                Great news! Your link is in perfect shape with no issues detected. Log in to explore how you can maximize your earnings from this link.
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
                        An error occurred while processing your request. Please try again later. If the issue persists, contact support.
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
                    <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Is Your Affiliate Link Switching Networks?
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed">
                    Your hard-earned commissions might be slipping away if your affiliate links are rerouting to a different network. Use our tool to ensure your links are secure and correctly aligned with your intended network.
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="affiliate-url" className="block text-sm font-medium text-gray-700 mb-2">
                            Enter Affiliate URL:
                        </label>
                        <input
                            type="url"
                            id="affiliate-url"
                            value={affiliateUrl}
                            onChange={(e) => setAffiliateUrl(e.target.value)}
                            required
                            placeholder="https://example.com/affiliate-link"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="bg-[#6ca979] text-white px-6 py-2 rounded-md hover:bg-[#5a8a66] transition-colors"
                    >
                        Check URL
                    </button>
                </form>
                
                {loading && (
                    <div className="mt-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6ca979]"></div>
                        <p className="mt-2 text-gray-600">Checking URL...</p>
                    </div>
                )}
                
                {resultMessage && (
                    <div className={`mt-6 p-4 border rounded-md flex items-start ${has404 || hasRedirectError ? 'bg-red-100 text-red-700 border-red-300' : multipleNetworks ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-green-100 text-green-700 border-green-300'}`}>
                        {resultMessage}
                    </div>
                )}
                
                {redirects.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold">Redirects:</h2>
                        <ul className="mt-4 space-y-2">
                            {redirects.map((redirect: Redirect, index: number) => (
                                <li key={index} className="p-4 border border-gray-200 rounded-md">
                                    <div className="text-sm text-gray-500">Redirect {index + 1}:</div>
                                    <div className="text-lg text-gray-900 truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {redirect.url.length > 55 ? `${redirect.url.substring(0, 55)}...` : redirect.url}
                                    </div>
                                    {redirect.name && (
                                        <div className="text-sm font-medium text-blue-500">
                                            Network: {redirect.name}
                                        </div>
                                    )}
                                    <div className={`text-sm font-medium ${typeof redirect.status === 'number' && redirect.status < 300 ? 'text-green-500' : 'text-red-500'}`}>
                                        Status: {redirect.status} ({redirect.type})
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">About this tool</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Can you test multiple URLs at once?</h3>
                            <p className="text-gray-700">
                                Absolutely! Log in to your account to test multiple URLs simultaneously. You can even import from Google Docs or your API, and we&apos;ll handle daily tests for you. Stay informed with notifications when an affiliate URL breaks or presents new opportunities.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">What is the Affiliate Link Checker?</h2>
                    <p className="text-gray-700 leading-relaxed">
                        This tool is essential for affiliate marketers who want to ensure their links are functioning correctly and driving traffic as intended. By quickly identifying issues like broken links or unauthorized redirects, you can take immediate action to optimize your affiliate campaigns. Additionally, this tool helps you uncover hidden relationships within affiliate networks, giving you greater control and transparency over your partnerships. Make sure your affiliate links are working to their full potential by regularly checking them with this tool.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">How does the Link checker work?</h2>
                    <p className="text-gray-700 leading-relaxed">
                        You can gain valuable insights into your affiliate links&apos; journey. We track every redirect and intermediary step to provide you with a clear picture of how your links are performing. This helps you identify any potential issues, such as unexpected redirects or unauthorized changes, ensuring your affiliate campaigns are as effective and transparent as possible.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">What actions are recommended if my link ends up on a different network?</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Subnetworks or subprograms are networks or programs that leverage the offerings of other networks, promoting them on their own platforms. While there&apos;s nothing inherently wrong with this practice, it could mean you&apos;re leaving money on the table. Learn more about sub-affiliate networks.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">How can program leasing lead to potential issues in affiliate marketing?</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Common issues associated with subnetworks include link tracking problems, lost sales, and delays in payments. Additionally, since subnetworks need to generate their own revenue, the mechanics of a program can often differ from the original. This can result in shorter cookie periods, lower commission rates, and other changes that might reduce your overall earnings. It&apos;s important to be aware of these potential pitfalls to ensure you&apos;re maximizing your affiliate marketing efforts and not missing out on potential income.
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
