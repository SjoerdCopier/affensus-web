"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AddressForm from "@/components/dashboard/address-form"
import pricingPlans from '@/pricing-plans.json'
import { ArrowUp, Check, Sparkles } from "lucide-react"

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
  // New invoice fields
  invoiceNumber?: string
  invoiceType?: 'invoice' | 'credit_note'
  invoiceDate?: string
  totalAmount?: number
  creditNoteForInvoiceId?: number
}

interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export default function BillingTab() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [billingAddress, setBillingAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
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

      // Load invoices
      const invoicesResponse = await fetch('/api/profile/invoices', {
        credentials: 'include'
      })

      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData.invoices || [])
      }

      // Load billing address
      const addressResponse = await fetch('/api/profile/billing-address', {
        credentials: 'include'
      })

      if (addressResponse.ok) {
        const addressData = await addressResponse.json()
        setBillingAddress(addressData.address)
      }

    } catch (error) {
      console.error('Error loading billing data:', error)
      setError('Failed to load billing data')
    } finally {
      setIsLoading(false)
    }
  }



  const handleManageSubscription = async () => {
    try {
      setError(null)
      
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url

    } catch (error) {
      console.error('Error creating portal session:', error)
      setError('Failed to open billing portal')
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getSubscriptionBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSaveAddress = async (address: Address) => {
    try {
      setError(null)
      
      const response = await fetch('/api/profile/billing-address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(address),
      })

      if (!response.ok) {
        throw new Error('Failed to save billing address')
      }

      setBillingAddress(address)
    } catch (error) {
      console.error('Error saving billing address:', error)
      setError('Failed to save billing address')
      throw error
    }
  }

  const handleUpgrade = async (planId: string) => {
    try {
      setError(null)
      
      const plan = pricingPlans.plans[planId as keyof typeof pricingPlans.plans]
      const stripePriceId = plan.stripePriceId

      if (!stripePriceId) {
        setError('Plan not available for your region')
        return
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          priceId: stripePriceId,
          planId: planId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url

    } catch (error) {
      console.error('Error creating checkout session:', error)
      setError('Failed to start upgrade process')
    }
  }

  const handleDownloadInvoice = async (invoiceNumber: string) => {
    try {
      setError(null)
      console.log('Starting invoice download for:', invoiceNumber)
      
      // Get invoice data
      const response = await fetch(`/api/invoice/${invoiceNumber}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch invoice data')
      }

      const { invoice } = await response.json()
      console.log('Invoice data loaded:', invoice)
      
      // Generate PDF using jsPDF
      await generateInvoicePDF(invoice, invoiceNumber)
      console.log('PDF generation completed')

    } catch (error) {
      console.error('Error downloading invoice:', error)
      setError(`Failed to download invoice: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Helper function to load image as data URL
  const loadImageAsDataURL = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = reject
      img.src = src
    })
  }



  const generateInvoicePDF = async (invoice: Record<string, unknown>, invoiceNumber: string) => {
    try {
      console.log('Starting PDF generation...')
      
      // Country code to name mapping for common countries
      const getCountryName = (countryCode: string) => {
        const countryMap: { [key: string]: string } = {
          'MY': 'Malaysia',
          'US': 'United States',
          'GB': 'United Kingdom',
          'CA': 'Canada',
          'AU': 'Australia',
          'SG': 'Singapore',
          'HK': 'Hong Kong',
          'TH': 'Thailand',
          'ID': 'Indonesia',
          'PH': 'Philippines',
          'VN': 'Vietnam',
          'JP': 'Japan',
          'KR': 'South Korea',
          'CN': 'China',
          'IN': 'India',
          'DE': 'Germany',
          'FR': 'France',
          'IT': 'Italy',
          'ES': 'Spain',
          'NL': 'Netherlands',
          'BE': 'Belgium',
          'CH': 'Switzerland',
          'AT': 'Austria',
          'SE': 'Sweden',
          'NO': 'Norway',
          'DK': 'Denmark',
          'FI': 'Finland'
        }
        return countryMap[countryCode] || countryCode
      }
      
      // Dynamically import jsPDF to avoid SSR issues
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.default
      console.log('jsPDF loaded successfully')
      
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      const margin = 20
      console.log('PDF document created')
      
      // Load images with error handling
      let logoImage = ''
      let sealImage = ''
      let signatureImage = ''
      
      try {
        logoImage = await loadImageAsDataURL('/images/morseXpress-logo.webp')
        console.log('Logo loaded successfully')
      } catch (error) {
        console.warn('Logo image failed to load:', error)
      }
      
      // Load company seal (WebP)
      try {
        sealImage = await loadImageAsDataURL('/company/seal.webp')
        console.log('Seal WebP loaded successfully')
      } catch (error) {
        console.warn('Seal WebP failed to load:', error)
      }
      
      // Load PNG signature (better compatibility than SVG)
      try {
        signatureImage = await loadImageAsDataURL('/company/signature.png')
        console.log('Signature PNG loaded successfully')
      } catch (error) {
        console.warn('Signature PNG failed to load:', error)
      }
    
      const isCredit = invoice.invoiceType === 'credit_note'
      const documentTitle = isCredit ? 'CREDIT NOTE' : 'INVOICE'
      const amountPrefix = isCredit ? '-' : ''
      
      // Format currency
      const formatAmount = (amount: number) => {
        const formatted = Math.abs((amount || 0) / 100).toFixed(2)
        return `${amountPrefix}$${formatted} ${(((invoice as Record<string, unknown>).amounts as Record<string, unknown>)?.currency || 'USD').toString().toUpperCase()}`
      }
      
      // HEADER SECTION - Better layout
      let currentY = 20
      
      // Company logo and name
      if (logoImage) {
        doc.addImage(logoImage, 'PNG', margin, currentY, 20, 20)
        doc.setFontSize(22)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0) // Black text
        doc.text('MorseXpress', margin + 23, currentY + 9)
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(107, 114, 128)
        doc.text('Master Morse Code Faster', margin + 23, currentY + 15)
        currentY += 30
      } else {
        doc.setFontSize(22)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0) // Black text
        doc.text('MorseXpress', margin, currentY + 5)
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(107, 114, 128)
        doc.text('Master Morse Code Faster', margin, currentY + 11)
        currentY += 25
      }
      
      // Document title (top right) - moved up and dark grey
      doc.setFontSize(32)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(75, 85, 99) // Dark grey
      doc.text(documentTitle, pageWidth - margin, 30, { align: 'right' })
      
      // Company info block - track start position for right column alignment
      const companyInfoStartY = currentY
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('Affensus Limited', margin, currentY)
      currentY += 6
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(75, 85, 99)
      doc.text('UNIT B, 3/F., KAI WAN HOUSE', margin, currentY)
      currentY += 5
      doc.text('146 TUNG CHOI STREET', margin, currentY)
      currentY += 5
      doc.text('MONGKOK, KLN, Hong Kong', margin, currentY)
      currentY += 8
      
      doc.setFontSize(9)
      doc.setTextColor(107, 114, 128)
      doc.text('Company Registration: 76782638-000-07-24-4', margin, currentY)
      currentY += 4
      doc.text('Email: info@morsexpress.com', margin, currentY)
      
      // Company seal moved to footer
    
      // INVOICE METADATA (right column, aligned with second line of company info)
      const metaBoxX = pageWidth - 60
      const metaBoxY = companyInfoStartY + 6  // Align with "UNIT B, 3/F., KAI WAN HOUSE"
      
      doc.setFontSize(10)
      doc.setTextColor(55, 65, 81)
      doc.setFont('helvetica', 'normal')
      doc.text(`${documentTitle}: ${invoice.invoiceNumber || invoiceNumber}`, metaBoxX, metaBoxY)
      doc.text(`Date: ${new Date((invoice as Record<string, unknown>).invoiceDate as string || (invoice as Record<string, unknown>).createdAt as string).toLocaleDateString()}`, metaBoxX, metaBoxY + 6)
      doc.text(`Status: ${((invoice as Record<string, unknown>).status as string || 'PAID').toUpperCase()}`, metaBoxX, metaBoxY + 12)
      
      // Add some spacing below the longest column
      currentY += 10
      
      // Separator line (thinner)
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, currentY, pageWidth - margin, currentY)
      currentY += 10
    
      // Credit Note Notice
      if (isCredit) {
        doc.setFillColor(254, 242, 242)
        doc.setDrawColor(252, 165, 165)
        doc.rect(margin, currentY, pageWidth - 2 * margin, 18, 'FD')
        doc.setFontSize(11)
        doc.setTextColor(153, 27, 27)
        doc.setFont('helvetica', 'bold')
        doc.text('⚠️ CREDIT NOTE NOTICE', margin + 5, currentY + 8)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('This document represents a refund for your original purchase.', margin + 5, currentY + 14)
        currentY += 25
      }
      
      // BILLING INFORMATION SECTION (less space above)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('BILLING INFORMATION', margin, currentY)
      currentY += 10
    
      // BILL TO section only (removed FROM since company info is above)
      const billToBoxWidth = (pageWidth - 2 * margin) / 2
      
      // BILL TO section
      doc.setFillColor(249, 250, 251)
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.2)
      doc.rect(margin, currentY, billToBoxWidth, 40, 'FD')
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('BILL TO', margin + 3, currentY + 8)
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(((invoice as Record<string, unknown>).billingName as string) || 'Customer', margin + 3, currentY + 16)
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(55, 65, 81)
      if (invoice.billingAddress) {
        let lineY = currentY + 22
        if ((invoice as Record<string, unknown>).billingEmail) {
          doc.text(((invoice as Record<string, unknown>).billingEmail as string), margin + 3, lineY)
          lineY += 4
        }
        if (((invoice as Record<string, unknown>).billingAddress as Record<string, unknown>)?.line1) {
          doc.text((((invoice as Record<string, unknown>).billingAddress as Record<string, unknown>).line1 as string), margin + 3, lineY)
          lineY += 4
        }
        if (((invoice as Record<string, unknown>).billingAddress as Record<string, unknown>)?.line2) {
          doc.text((((invoice as Record<string, unknown>).billingAddress as Record<string, unknown>).line2 as string), margin + 3, lineY)
          lineY += 4
        }
        const billingAddr = (invoice as Record<string, unknown>).billingAddress as Record<string, unknown>
        const cityLine = `${billingAddr?.city || ''}, ${billingAddr?.state || ''} ${billingAddr?.postalCode || ''}`.trim()
        if (cityLine !== ', ') {
          doc.text(cityLine, margin + 3, lineY)
          lineY += 4
        }
        if (((invoice as Record<string, unknown>).billingAddress as Record<string, unknown>)?.country) {
          doc.text(getCountryName((((invoice as Record<string, unknown>).billingAddress as Record<string, unknown>).country as string)), margin + 3, lineY)
        }
      }
      
      currentY += 50
    
      // LINE ITEMS SECTION
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('ITEMS & SERVICES', margin, currentY)
      currentY += 10
      
      // Table header
      doc.setFillColor(249, 250, 251)
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.2)
      doc.rect(margin, currentY, pageWidth - 2 * margin, 10, 'FD')
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(55, 65, 81)
      doc.text('DESCRIPTION', margin + 5, currentY + 7)
      doc.text('AMOUNT', pageWidth - margin - 5, currentY + 7, { align: 'right' })
      currentY += 10
      
      // Table row
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.2)
      doc.rect(margin, currentY, pageWidth - 2 * margin, 20, 'S')
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text(((invoice as Record<string, unknown>).description as string) || 'Affensus Premium Subscription', margin + 5, currentY + 8)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      doc.text(isCredit ? 'Refund for premium subscription purchase' : 'One-time payment for premium features and content', margin + 5, currentY + 14)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      if (isCredit) {
        doc.setTextColor(220, 38, 38) // Red for credit
      } else {
        doc.setTextColor(31, 41, 55) // Dark gray for normal
      }
      const amounts = (invoice as Record<string, unknown>).amounts as Record<string, unknown>
      doc.text(formatAmount((amounts?.subtotal as number) || (amounts?.total as number)), pageWidth - margin - 5, currentY + 10, { align: 'right' })
      currentY += 30
      
      // TOTALS SECTION
      const totalsX = pageWidth - 90
    
      // Totals calculation
      doc.setFontSize(11)
      doc.setTextColor(55, 65, 81)
      doc.text('Subtotal:', totalsX, currentY)
      if (isCredit) {
        doc.setTextColor(220, 38, 38) // Red for credit
      } else {
        doc.setTextColor(31, 41, 55) // Dark gray for normal
      }
      doc.text(formatAmount((amounts?.subtotal as number) || (amounts?.total as number)), pageWidth - margin, currentY, { align: 'right' })
      currentY += 8
      
      doc.setTextColor(55, 65, 81)
      doc.text(`Tax (${(amounts?.taxRate as number) || 0}%):`, totalsX, currentY)
      if (isCredit) {
        doc.setTextColor(220, 38, 38) // Red for credit
      } else {
        doc.setTextColor(31, 41, 55) // Dark gray for normal
      }
      doc.text(formatAmount((amounts?.taxAmount as number) || 0), pageWidth - margin, currentY, { align: 'right' })
      currentY += 10
      
      // Total line (thinner)
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(totalsX, currentY, pageWidth - margin, currentY)
      currentY += 8
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(55, 65, 81)
      doc.text('Total:', totalsX, currentY)
      if (isCredit) {
        doc.setTextColor(220, 38, 38) // Red for credit
      } else {
        doc.setTextColor(37, 99, 235) // Blue for normal
      }
      doc.text(formatAmount(amounts?.total as number), pageWidth - margin, currentY, { align: 'right' })
      
      // FOOTER SECTION
      const footerY = pageHeight - 50
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, footerY, pageWidth - margin, footerY)
      
      // Footer text in column format (smaller text)
      doc.setFontSize(9)
      doc.setTextColor(107, 114, 128)
      doc.setFont('helvetica', 'normal')
      if (isCredit) {
        doc.text('Refund processed successfully.', margin, footerY + 10)
        doc.text('We\'re sorry to see you go!', margin, footerY + 15)
        doc.text('Your refund will be credited back to', margin, footerY + 20)
        doc.text('your original payment method within', margin, footerY + 25)
        doc.text('3-5 business days.', margin, footerY + 30)
      } else {
        doc.text('Thank you for choosing MorseXpress!', margin, footerY + 10)
        doc.text('Your payment enables us to continue', margin, footerY + 15)
        doc.text('providing quality Morse code education', margin, footerY + 20)
        doc.text('and tools.', margin, footerY + 25)
      }
      
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text(`This ${documentTitle.toLowerCase()} was generated on ${new Date().toLocaleDateString()}`, margin, footerY + 38)
      doc.text('Affensus Limited • Hong Kong Company Registration: 76782638-000-07-24-4', margin, footerY + 43)
      
      // SIGNATURE AND SEAL AREA (right side)
      const signatureX = pageWidth - 90
      
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text('Authorized Signature', signatureX, footerY + 9)
      
      // Add signature image or fallback line
      if (signatureImage) {
        doc.addImage(signatureImage, 'PNG', signatureX + 5, footerY + 17, 35, 14)
      } else {
        // Fallback signature line
        doc.setDrawColor(209, 213, 219)
        doc.line(signatureX, footerY + 25, pageWidth - margin, footerY + 25)
      }
      
      // Add company seal next to signature
      if (sealImage) {
        doc.addImage(sealImage, 'PNG', signatureX + 55, footerY + 12, 18, 18)
      }
      
    
    console.log('About to save PDF...')
    
    // Save the PDF
    try {
      doc.save(`${invoiceNumber}.pdf`)
      console.log('PDF save completed')
    } catch (saveError) {
      console.error('Error saving PDF:', saveError)
      throw new Error(`PDF save failed: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`)
    }
    
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError)
      throw pdfError
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Unable to load billing information</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page or contact support if the problem persists.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            View your current subscription details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Badge className={getSubscriptionBadgeColor(userProfile.subscriptionStatus)}>
                {userProfile.subscriptionStatus.charAt(0).toUpperCase() + userProfile.subscriptionStatus.slice(1)}
              </Badge>
              <span className="text-sm text-gray-600">
                {userProfile.subscriptionStatus === 'free' ? 'Free Plan' : 'Premium Plan'}
              </span>
            </div>
            
            {userProfile.subscriptionStatus !== 'free' && (
              <Button 
                variant="outline"
                onClick={handleManageSubscription}
              >
                Manage Subscription
              </Button>
            )}
          </div>

          {userProfile.subscriptionExpiresAt && (
            <p className="text-sm text-gray-600">
              {userProfile.subscriptionStatus === 'active' ? 'Renews' : 'Expires'} on{' '}
              {formatDate(userProfile.subscriptionExpiresAt)}
            </p>
          )}

          {userProfile.trialEndsAt && (
            <p className="text-sm text-blue-600">
              Trial ends on {formatDate(userProfile.trialEndsAt)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Section */}
      {userProfile.subscriptionStatus === 'free' && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Sparkles className="h-5 w-5" />
              Upgrade Your Experience
            </CardTitle>
            <CardDescription className="text-blue-700">
              Unlock premium features and accelerate your Morse code learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(pricingPlans.plans)
                .filter(([planId]) => planId !== 'free')
                .map(([planId, plan]) => {
                  const currentPlanPrice = 0 // Free plan
                  const upgradePrice = (plan as Record<string, unknown>)?.price && typeof (plan as Record<string, unknown>).price === 'object' && (plan as Record<string, unknown>).price !== null && 'monthly' in ((plan as Record<string, unknown>).price as Record<string, unknown>) 
                    ? (((plan as Record<string, unknown>).price as Record<string, unknown>).monthly as Record<string, unknown>).amount as number - currentPlanPrice 
                    : 0
                  
                  return (
                    <div key={planId} className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{plan?.name?.en || 'Unknown Plan'}</h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          ${(upgradePrice / 100).toFixed(2)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">{plan?.description?.en || 'No description available'}</p>
                        <div className="text-xs text-blue-600 font-medium">
                          Pay one-time to get:
                        </div>
                        <ul className="space-y-1">
                          {plan?.features?.en?.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-xs text-gray-700">
                              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          )) || []}
                          {plan?.features?.en?.length > 3 && (
                            <li className="text-xs text-gray-500">
                              +{plan.features.en.length - 3} more features
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleUpgrade(planId)}
                      >
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Upgrade to {plan?.name?.en || 'Unknown Plan'}
                      </Button>
                    </div>
                  )
                })}
            </div>
            
            <div className="text-center pt-4 border-t border-blue-200">
              <p className="text-sm text-blue-700">
                💳 All upgrades are one-time payments. No recurring charges.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Address */}
      <AddressForm
        onSave={handleSaveAddress}
        address={billingAddress ? { ...billingAddress, addressType: 'personal' as const } : undefined}
        onCancel={() => {}}
      />

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your payment history and download invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No billing history available
            </p>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => {
                const isCredit = invoice.invoiceType === 'credit_note'
                const amount = invoice.totalAmount || invoice.amountPaid
                const displayAmount = isCredit ? -Math.abs(amount) : amount
                
                return (
                  <div key={invoice.id} className={`flex items-center justify-between p-4 border rounded-lg ${isCredit ? 'bg-red-50 border-red-200' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {/* Invoice Number */}
                        {invoice.invoiceNumber && (
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {invoice.invoiceNumber}
                          </code>
                        )}
                        
                        {/* Amount */}
                        <span className={`font-medium ${isCredit ? 'text-red-600' : ''}`}>
                          {invoice.currency 
                            ? formatCurrency(displayAmount, invoice.currency)
                            : 'Amount not available'
                          }
                        </span>
                        
                        {/* Status Badge */}
                        <Badge 
                          variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                          className={
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'refunded' ? 'bg-red-100 text-red-800' :
                            isCredit ? 'bg-red-100 text-red-800' :
                            ''
                          }
                        >
                          {isCredit ? 'credit note' : (invoice.status || 'unknown')}
                        </Badge>
                        
                        {/* Type Badge */}
                        {isCredit && (
                          <Badge variant="outline" className="text-red-600 border-red-300">
                            Refund
                          </Badge>
                        )}
                      </div>
                      
                      {/* Date */}
                      <p className="text-sm text-gray-600">
                        {invoice.invoiceDate 
                          ? formatDate(invoice.invoiceDate)
                          : invoice.createdAt 
                          ? formatDate(invoice.createdAt) 
                          : 'Date not available'
                        }
                      </p>
                      
                      {/* Description */}
                      {invoice.description && (
                        <p className="text-sm text-gray-500 mt-1">{invoice.description}</p>
                      )}
                      
                      {/* Credit Note Reference */}
                      {isCredit && invoice.creditNoteForInvoiceId && (
                        <p className="text-xs text-red-600 mt-1">
                          Refund for original invoice
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {/* Download Invoice Button */}
                      {invoice.invoiceNumber && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.invoiceNumber!)}
                        >
                          Download PDF
                        </Button>
                      )}
                      
                      {/* Legacy Stripe Invoice Link */}
                      {invoice.hostedInvoiceUrl && !invoice.invoiceNumber && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(invoice.hostedInvoiceUrl, '_blank')}
                        >
                          View Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
