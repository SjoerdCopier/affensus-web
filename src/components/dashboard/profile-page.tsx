"use client"

import { useState, useEffect } from 'react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from 'lucide-react'


import PreferencesTab from "@/components/dashboard/preferences-tab"
import BillingTab from "@/components/dashboard/billing-tab"
import PlansTab from "@/components/dashboard/plans-tab"

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  subscriptionStatus: string
  stripeCustomerId?: string
  subscriptionExpiresAt?: string
  trialEndsAt?: string
  createdAt: string
}

interface Invoice {
  id: string
  stripeInvoiceId: string
  amountPaid: number
  currency: string
  status: string
  description?: string
  invoiceUrl?: string
  hostedInvoiceUrl?: string
  periodStart?: string
  periodEnd?: string
  createdAt: string
}

interface UserPreferences {
  speedPreference: number
  audioEnabled: boolean
  notificationsEnabled: boolean
  theme: string
  language: string
}

export default function ProfilePageComponent() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [, setPreferences] = useState<UserPreferences | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'preferences' | 'plans' | 'refund'>('profile')

  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [refundFeedback, setRefundFeedback] = useState('')
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false)
  const [refundSubmitted, setRefundSubmitted] = useState(false)

  useEffect(() => {
    loadProfileData()
    
    // Handle URL parameters for tab selection
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    
    if (tabParam === 'plans') {
      setActiveTab('plans')
    } else if (tabParam === 'billing') {
      setActiveTab('billing')
    } else if (tabParam === 'preferences') {
      setActiveTab('preferences')
    } else if (tabParam === 'refund') {
      setActiveTab('refund')
    }
  }, [])

  const loadProfileData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load user profile
      const profileResponse = await fetch('/api/profile', {
        credentials: 'include'
      })

      if (!profileResponse.ok) {
        if (profileResponse.status === 401) {
          window.location.href = '/auth'
          return
        }
        throw new Error('Failed to load profile')
      }

      const profileData = await profileResponse.json()
      setUserProfile(profileData.user)
      setFirstName(profileData.user.firstName || '')
      setLastName(profileData.user.lastName || '')

      // Load preferences
      const prefsResponse = await fetch('/api/profile/preferences', {
        credentials: 'include'
      })

      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json()
        setPreferences(prefsData.preferences)
      }

      // Load invoices for refund eligibility check
      const invoicesResponse = await fetch('/api/profile/invoices', {
        credentials: 'include'
      })

      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData.invoices || [])
      }

    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      const updatedProfile = await response.json()
      setUserProfile(updatedProfile.user)

    } catch (error) {
      console.error('Error saving profile:', error)
      setError('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const checkRefundEligibility = () => {
    if (!userProfile) return { eligible: false, reason: 'No user profile found' }
    
    // For free users, they're eligible to see the refund tab (to encourage upgrades)
    if (userProfile.subscriptionStatus === 'free') {
      return { eligible: true, reason: 'free_user' }
    }
    
    // For paid users, check if they have a recent payment within 7 days
    const paidInvoices = invoices.filter(invoice => 
      invoice.status === 'paid' && invoice.amountPaid > 0
    )
    
    if (paidInvoices.length === 0) {
      return { eligible: false, reason: 'No paid invoices found' }
    }
    
    // Get the most recent payment
    const mostRecentPayment = paidInvoices.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0]
    
    const paymentDate = new Date(mostRecentPayment.createdAt)
    const now = new Date()
    const daysSincePayment = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSincePayment <= 7) {
      return { 
        eligible: true, 
        reason: 'within_window',
        daysSincePayment,
        paymentDate: mostRecentPayment.createdAt
      }
    } else {
      return { 
        eligible: false, 
        reason: 'outside_window',
        daysSincePayment,
        paymentDate: mostRecentPayment.createdAt
      }
    }
  }

  const handleRefundRequest = async () => {
    try {
      setIsSubmittingRefund(true)
      setError(null)

      const response = await fetch('/api/refund-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          description: refundFeedback || 'Refund request submitted',
          userEmail: userProfile?.email,
          subscriptionStatus: userProfile?.subscriptionStatus
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit refund request')
      }

      await response.json()

      // Clear form and show success message in the UI
      setRefundFeedback('')
      setRefundSubmitted(true)
      
      // Reload profile data to reflect subscription status change
      await loadProfileData()
      
    } catch (error) {
      console.error('Error submitting refund request:', error)
      setError('Failed to submit refund request. Please try again.')
    } finally {
      setIsSubmittingRefund(false)
    }
  }

  if (isLoading) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-blue-100 rounded">
                <User className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xs font-bold text-gray-900">Profile Management</h1>
                <p className="text-xs text-gray-600">Manage your account settings and subscription</p>
              </div>
            </div>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-gray-600">Loading your profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="pt-4 pl-4 pr-4 pb-6">
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-blue-100 rounded">
                <User className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xs font-bold text-gray-900">Profile Management</h1>
                <p className="text-xs text-gray-600">Manage your account settings and subscription</p>
              </div>
            </div>
            <div className="text-center py-8">
              <h2 className="text-sm font-semibold mb-2">Unable to load profile</h2>
              <p className="text-xs text-gray-600 mb-4">Please try refreshing the page or contact support if the problem persists.</p>
              <Button onClick={() => window.location.reload()} size="sm" className="text-xs">
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 pl-4 pr-4 pb-6">
      <div className="space-y-3">
        {/* Header */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-blue-100 rounded">
              <User className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-gray-900">Profile Management</h1>
              <p className="text-xs text-gray-600">Manage your account settings and subscription</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 p-3">
            <div className="overflow-x-auto overflow-y-hidden">
              <nav className="-mb-px flex space-x-8 min-w-max">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs whitespace-nowrap ${
                    activeTab === 'profile'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs whitespace-nowrap ${
                    activeTab === 'billing'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Subscription & Billing
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs whitespace-nowrap ${
                    activeTab === 'preferences'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Preferences
                </button>
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs whitespace-nowrap ${
                    activeTab === 'plans'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Plans
                </button>
                {!isLoading && userProfile && (
                  <button
                    onClick={() => setActiveTab('refund')}
                    className={`py-2 px-1 border-b-2 font-medium text-xs whitespace-nowrap ${
                      activeTab === 'refund'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-red-500 hover:text-red-700 hover:border-red-300'
                    }`}
                  >
                    Refund
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 mb-2">Profile Information</h3>
                  <p className="text-xs text-gray-600 mb-4">Update your personal information and account details</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-xs">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs">Email Address</Label>
                  <Input
                    id="email"
                    value={userProfile.email}
                    disabled
                    className="bg-gray-50 text-xs"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email address cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Account Created</Label>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatDate(userProfile.createdAt)}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    size="sm"
                    className="text-xs"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && <BillingTab />}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && <PreferencesTab />}

            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <PlansTab 
                currentLocale="en"
                userSubscriptionStatus={userProfile.subscriptionStatus}
              />
            )}

            {/* Refund Tab */}
            {activeTab === 'refund' && (() => {
              const eligibility = checkRefundEligibility()
              
              if (refundSubmitted) {
                return (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-red-600 mb-2">Request Refund</h3>
                      <p className="text-xs text-gray-600 mb-4">Submit a refund request for your subscription</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <div className="mb-4">
                        <svg className="w-8 h-8 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-green-800 mb-2">
                        Refund Processed Successfully
                      </h3>
                      <p className="text-xs text-green-700 mb-4">
                        We&apos;re sad to see you go, but we understand that sometimes things don&apos;t work out as expected. 
                        Whatever your reason was, we appreciate you giving MorseXpress a try.
                      </p>
                      <p className="text-xs text-green-700">
                        Your refund has been processed and will be credited back to your original payment method within 3-5 business days. 
                        Your subscription has been cancelled and you now have access to our free tier.
                      </p>
                    </div>
                  </div>
                )
              }
              
              return (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-red-600 mb-2">Request Refund</h3>
                    <p className="text-xs text-gray-600 mb-4">Submit a refund request for your subscription</p>
                  </div>
                  
                  <div className={`p-4 border rounded-lg ${
                    eligibility.eligible 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`text-xs font-semibold mb-2 ${
                      eligibility.eligible ? 'text-red-800' : 'text-gray-800'
                    }`}>
                      Refund Policy
                    </h3>
                    <p className={`text-xs ${
                      eligibility.eligible ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      {eligibility.reason === 'free_user' 
                        ? "You have not yet subscribed to a paid plan, so we can't issue a refund. Upgrade to a paid plan to be eligible for refunds within 7 days of payment."
                        : eligibility.reason === 'within_window'
                        ? `You can request a refund. Your last payment was ${eligibility.daysSincePayment} days ago.`
                        : eligibility.reason === 'outside_window'
                        ? `Refund window has expired. Your last payment was ${eligibility.daysSincePayment} days ago (7-day limit).`
                        : eligibility.reason === 'No paid invoices found'
                        ? "No payment history found. You can request a refund within 7 days of your first payment."
                        : "Unable to determine refund eligibility. Please contact support."
                      }
                    </p>
                  </div>

                  {eligibility.eligible && (
                    <>
                      <div>
                        <Label htmlFor="refundFeedback" className="text-xs">Feedback (Optional)</Label>
                        <textarea
                          id="refundFeedback"
                          value={refundFeedback}
                          onChange={(e) => setRefundFeedback(e.target.value)}
                          placeholder="Please let us know why you're requesting a refund. Your feedback helps us improve our service."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none text-xs"
                          rows={4}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          onClick={handleRefundRequest}
                          disabled={isSubmittingRefund}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white text-xs"
                        >
                          {isSubmittingRefund ? 'Submitting...' : 'Request Refund'}
                        </Button>
                      </div>
                    </>
                  )}

                  {eligibility.reason === 'free_user' && (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-600">
                        Upgrade to a paid plan to be eligible for refunds.
                      </p>
                    </div>
                  )}

                  {!eligibility.eligible && eligibility.reason !== 'free_user' && (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-600">
                        You are not currently eligible for a refund.
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
} 