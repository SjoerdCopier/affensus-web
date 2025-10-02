'use client';

import { useState } from 'react'
import Image from 'next/image'

interface ProjectWithStats {
    id: string
    name: string
    country: string
    language_name?: string
}

interface MerchantsProps {
    selectedProject?: ProjectWithStats | null
}

export function DashboardMerchants({ selectedProject }: MerchantsProps) {
    const [url, setUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [merchant, setMerchant] = useState({
        logo: '/images/logo-placeholder.webp'
    })
    const [formData, setFormData] = useState({
        webshopName: '',
        displayUrl: '',
    })
    const [shortDescription, setShortDescription] = useState('')
    
    const projectLanguage = selectedProject?.language_name || 'English'

    const fetchLogo = async (displayUrl: string) => {
        try {
            console.log('Fetching logo for URL:', displayUrl);
            const response = await fetch('/api/logo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: displayUrl })
            })
            const result = await response.json()
            console.log('Logo API response:', result);
            
            if (result.success && result.data?.logo) {
                console.log('Logo data URL received');
                return result.data.logo
            }
            console.log('Using placeholder logo');
            return '/images/logo-placeholder.webp'
        } catch (error) {
            console.error('Error fetching logo:', error)
            return '/images/logo-placeholder.webp'
        }
    }

    const fetchOpenAIContent = async (metaData: { text?: string }, url: string) => {
        const response = await fetch('/api/openai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `Write a short summary about "${url}" in maximum 20 words AND generate a minimum of 5 unique selling points based on the following guidelines: \n
          1. Title: Use lowercase for all other words except for proper nouns (e.g., brand names, locations) and acronyms And start of the title with a capital letter. Use a maximum of 4 words.\n
          2. Description: Write in maximum of 2 sentences the description that makes it a unique selling point. Extract specific details from the provided text like shipping costs, delivery times, customer ratings, and payment methods. We are not the owner of the store we are giving it a review. So don't say our or we.\n
          Make sure the USP is timeless, so do not mention dates or specific coupon codes. Also do not talk about cookies or user experience and data sharing. Make sure the USP's are not repetitive in wording and are unique. Focus on extracting and highlighting actual facts from the provided text rather than making generic statements.\n
          ${metaData.text ? `Extract specific USPs from this information: ${metaData.text}. Use exact numbers, prices, and details when available.` : ''} Keep the summary concise and exclude specific dates or references to events or seasonality to make it timeless. Write the summary for our user in mind to give them a short overview about the merchant. The description should be in ${projectLanguage}. Use informal addressing. Note that we are not the merchant but we write about them. Make sure to write unique content and not repetitive.\n
          Return the response in exactly this structure:\n          {\n            "storeName": "store name",\n            "description": "short description",\n            "usps": [\n              {\n                "title": "title",\n                "description": "description"\n              }\n            ],\n            "keyFeatures": ["feature1", "feature2", "feature3"],\n            "targetAudience": "target audience",\n            "language": ""\n          }`,
                structure: {
                    storeName: 'string',
                    description: 'string',
                    usps: [{ title: 'string', description: 'string' }],
                    keyFeatures: ['string', 'string', 'string'],
                    targetAudience: 'string',
                    language: 'string'
                }
            }),
        })
        if (!response.ok) throw new Error('Failed to get OpenAI response')
        const result = await response.json()
        return result.success ? result.data : result
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const displayUrl = url.startsWith('http') ? url : `https://${url}`
            
            // Fetch logo
            const logo = await fetchLogo(displayUrl)
            
            // Fetch OpenAI content
            const metaData = { text: '' } // You can extend this to scrape meta data if needed
            const openAIData = await fetchOpenAIContent(metaData, displayUrl)
            
            // Update merchant state with fetched logo
            setMerchant({
                logo: logo
            })
            
            // Update form data with OpenAI data
            setFormData({
                webshopName: openAIData.storeName,
                displayUrl: displayUrl,
            })
            
            setShortDescription(openAIData.description || '')
            
            setShowForm(true)
        } catch (err) {
            console.error('Error processing store:', err)
            setError(err instanceof Error ? err.message : 'Failed to process store')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="pt-4 pl-4 pr-4 pb-6">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-lg font-bold text-gray-900 mb-1">
                    Store Creator
                </h1>
                <p className="text-xs text-gray-600">
                    Create new merchant stores by entering a URL
                </p>
            </div>

            {/* Input Section */}
            {!showForm ? (
                <div className="bg-white rounded border border-gray-200 p-3 mb-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="url-input" className="block text-xs font-medium text-gray-700 mb-1">
                                Store URL
                            </label>
                            <input
                                type="url"
                                id="url-input"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Processing...' : 'Continue'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded border border-gray-200 p-3 mb-4">
                    {merchant.logo && (
                        <div className="mb-4 flex justify-center">
                            <Image src={merchant.logo} alt="Store Logo" width={100} height={100} />
                        </div>
                    )}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Store Name</label>
                            <input
                                type="text"
                                value={formData.webshopName}
                                onChange={(e) => setFormData(prev => ({ ...prev, webshopName: e.target.value }))}
                                placeholder="Store name"
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Display URL</label>
                            <input
                                type="text"
                                value={formData.displayUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, displayUrl: e.target.value }))}
                                placeholder="Display URL"
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Short Description</label>
                            <input
                                type="text"
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                placeholder="Short description"
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white rounded border border-gray-200 p-3 mb-4">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-xs text-gray-600">Processing...</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-white rounded border border-gray-200 p-3 mb-4">
                    <div className="p-4 border rounded-md flex items-start bg-red-100 text-red-700 border-red-300">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 mr-2"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        <div className="text-sm">{error}</div>
                    </div>
                </div>
            )}
        </div>
    )
}

