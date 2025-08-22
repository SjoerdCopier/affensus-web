"use client"

import { useLocaleTranslations } from "@/hooks/use-locale-translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Breadcrumbs from "@/components/breadcrumbs"

export default function RefundPolicyPage() {
  const { t: tBase } = useLocaleTranslations()
  
  // Helper function to get translations from messages
  const t = (key: string) => {
    const translation = tBase(`legal.refundPolicy.${key}`)
    if (translation !== `legal.refundPolicy.${key}`) {
      return translation
    }
    
    // Fallback translations
    const fallbacks: { [key: string]: string } = {
      'title': 'Refund Policy',
      'subtitle': 'Our commitment to your satisfaction with Affensus services',
      'breadcrumb': 'Refund Policy',
      'lastUpdated': 'Last Updated',
      'sections.introduction.title': 'Affensus Refund Policy',
      'sections.introduction.paragraph1': 'You are entitled to a refund within 7 days of signing up with Affensus. No questions asked!',
      'sections.howToRequest.title': 'How to Request a Refund',
      'sections.howToRequest.paragraph1': 'Follow these simple steps to request your refund:',
      'sections.processingTime.title': 'Refund Processing Time',
      'sections.processingTime.paragraph1': 'The refund process is quick and easy. You can expect to see the refund reflected in your account within 5-10 business days, depending on your payment method.',
      'sections.feedback.title': 'We Value Your Feedback',
      'sections.feedback.paragraph1': 'At Affensus, we&apos;re committed to providing the best possible experience for our users. If you&apos;re considering a refund, we&apos;d love to hear from you about how we can improve our service.',
      'sections.feedback.paragraph2': 'Please take a moment to share your thoughts with us:',
      'sections.feedback.paragraph3': 'Your feedback is invaluable and helps us continually improve. You can share your thoughts by emailing us at feedback@affensus.com or through the feedback form in your dashboard.'
    }
    return fallbacks[key] || key
  }

  // Add raw method to handle arrays
  t.raw = (key: string) => {
    // Try to get translation from the hook
    const translation = tBase(`legal.refundPolicy.${key}`)
    if (translation !== `legal.refundPolicy.${key}` && Array.isArray(translation)) {
      return translation
    }
    
    // Fallback arrays
    const fallbackArrays: { [key: string]: string[] } = {
      'sections.howToRequest.steps': [
        'Log in to your Affensus dashboard',
        'Click on your profile in the top right corner',
        'Select "Subscriptions" from the dropdown menu',
        'Find the "Request Refund" button and click it',
        'Your refund will be automatically approved'
      ],
      'sections.feedback.questions': [
        'What aspects of our service didn&apos;t meet your expectations?',
        'Are there any features you feel are missing?',
        'How can we enhance your experience with Affensus?'
      ]
    }
    return fallbackArrays[key] || []
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs
        items={[
          {
            label: t('breadcrumb'),
            href: '/refund-policy',
            current: true
          }
        ]}
      />
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('subtitle')}
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="secondary">
            {t('lastUpdated')}: {new Date().toLocaleDateString()}
          </Badge>
        </div>
      </div>

      <div className="space-y-8">
        {/* Introduction Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('sections.introduction.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium text-lg">
                {t('sections.introduction.paragraph1')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How to Request Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('sections.howToRequest.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {t('sections.howToRequest.paragraph1')}
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {t.raw('sections.howToRequest.steps').map((step: string, index: number) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Processing Time Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('sections.processingTime.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {t('sections.processingTime.paragraph1')}
            </p>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('sections.feedback.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {t('sections.feedback.paragraph1')}
            </p>
            <p className="text-gray-700">
              {t('sections.feedback.paragraph2')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {t.raw('sections.feedback.questions').map((question: string, index: number) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
            <p className="text-gray-700">
              {t('sections.feedback.paragraph3')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />
      
      <div className="text-center text-gray-600">
        <p>
          We&apos;re here to help you succeed with Affensus. If you have any questions about our refund policy, please don&apos;t hesitate to contact us.
        </p>
      </div>
    </div>
  )
}
