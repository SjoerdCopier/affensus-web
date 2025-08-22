"use client"

import { useLocaleTranslations } from "@/hooks/use-locale-translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Breadcrumbs from "@/components/breadcrumbs"

export default function DataDeletionPage() {
  const { t: tBase } = useLocaleTranslations()
  
  // Helper function to get translations from messages
  const t = (key: string) => {
    const translation = tBase(`legal.dataDeletion.${key}`)
    if (translation !== `legal.dataDeletion.${key}`) {
      return translation
    }
    
    // Fallback translations
    const fallbacks: { [key: string]: string } = {
      'title': 'Data Deletion Request',
      'subtitle': 'How to request deletion of your personal data from Affensus',
      'breadcrumb': 'Data Deletion',
      'lastUpdated': 'Last Updated',
      'sections.introduction.title': 'Introduction',
      'sections.introduction.paragraph1': 'At Affensus, we respect your right to control your personal data. This page explains how you can request the deletion of your personal information from our platform.',
      'sections.introduction.paragraph2': 'We are committed to processing data deletion requests promptly and in accordance with applicable data protection laws, including GDPR and CCPA.',
      'sections.introduction.compliance': 'We comply with data protection regulations and will process your deletion request within 30 days.',
      'sections.yourRights.title': 'Your Data Deletion Rights',
      'sections.yourRights.paragraph1': 'You have the right to request deletion of your personal data at any time. This includes:',
      'sections.yourRights.paragraph2': 'We will process your request within 30 days and confirm the deletion in writing.',
      'sections.whatWeDelete.title': 'What We Delete',
      'sections.whatWeDelete.paragraph1': 'When you request data deletion, we will remove the following information:',
      'sections.howToRequest.title': 'How to Request Data Deletion',
      'sections.howToRequest.paragraph1': 'You can request data deletion through the following methods:',
      'sections.processingTime.title': 'Processing Time',
      'sections.processingTime.paragraph1': 'We aim to process all data deletion requests within 30 days of receipt.',
      'sections.processingTime.paragraph2': 'For urgent requests or if you have concerns about our response time, please contact us directly.',
      'sections.confirmation.title': 'Confirmation of Deletion',
      'sections.confirmation.paragraph1': 'Once your data has been deleted, we will send you a confirmation email.',
      'sections.confirmation.paragraph2': 'Please note that some information may be retained for legal or regulatory purposes as required by law.',
      'sections.contactInfo.title': 'Contact Information',
      'sections.contactInfo.paragraph1': 'For data deletion requests or questions about your privacy rights, please contact us:',
      'sections.legalBasis.title': 'Legal Basis for Data Deletion',
      'sections.legalBasis.paragraph1': 'Your right to data deletion is protected under various data protection laws:',
      'sections.legalBasis.paragraph2': 'We process deletion requests in accordance with these legal frameworks and our privacy policy.'
    }
    return fallbacks[key] || key
  }

  // Add raw method to handle arrays
  t.raw = (key: string) => {
    // Try to get translation from the hook
    const translation = tBase(`legal.dataDeletion.${key}`)
    if (translation !== `legal.dataDeletion.${key}` && Array.isArray(translation)) {
      return translation
    }
    
    // Fallback arrays
    const fallbackArrays: { [key: string]: string[] } = {
      'sections.yourRights.items': [
        'Account information and profile data',
        'Learning progress and preferences',
        'Usage statistics and analytics data',
        'Communication history and support tickets',
        'Device and browser information',
        'Payment and billing information (if applicable)'
      ],
      'sections.whatWeDelete.items': [
        'Personal identification information',
        'Account credentials and authentication data',
        'Learning progress and course history',
        'User preferences and settings',
        'Communication records and support tickets',
        'Analytics and usage data',
        'Device and browser information',
        'Payment and billing records (if applicable)'
      ],
      'sections.howToRequest.items': [
        'Email us at privacy@affensus.com with subject "Data Deletion Request"',
        'Include your email address and any account identifiers',
        'Specify which data you want deleted (all data or specific categories)',
        'Provide any additional context that may help us locate your data'
      ],
      'sections.legalBasis.items': [
        'GDPR Article 17 (Right to Erasure)',
        'CCPA Section 1798.105 (Right to Delete)',
        'Other applicable data protection laws',
        'Our commitment to user privacy and data protection'
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
            href: '/data-deletion',
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
            <p className="text-gray-700">
              {t('sections.introduction.paragraph1')}
            </p>
            <p className="text-gray-700">
              {t('sections.introduction.paragraph2')}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                {t('sections.introduction.compliance')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('sections.yourRights.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {t('sections.yourRights.paragraph1')}
            </p>
            <p className="text-gray-700">
              {t('sections.yourRights.paragraph2')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {t.raw('sections.yourRights.items').map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* What We Delete Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('sections.whatWeDelete.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {t('sections.whatWeDelete.paragraph1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {t.raw('sections.whatWeDelete.items').map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
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
              {t.raw('sections.howToRequest.items').map((item: string, index: number) => (
                <li key={index}>{item}</li>
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
            <p className="text-gray-700">
              {t('sections.processingTime.paragraph2')}
            </p>
          </CardContent>
        </Card>

        {/* Confirmation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('sections.confirmation.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {t('sections.confirmation.paragraph1')}
            </p>
            <p className="text-gray-700">
              {t('sections.confirmation.paragraph2')}
            </p>
          </CardContent>
        </Card>

        {/* Legal Basis Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('sections.legalBasis.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {t('sections.legalBasis.paragraph1')}
            </p>
            <p className="text-gray-700">
              {t('sections.legalBasis.paragraph2')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {t.raw('sections.legalBasis.items').map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">
              {t('sections.contactInfo.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-800">
              {t('sections.contactInfo.paragraph1')}
            </p>
            <div className="bg-white border border-blue-300 rounded-lg p-4">
              <div className="space-y-2">
                <p className="text-blue-900">
                  <strong>Email:</strong> privacy@affensus.com
                </p>
                <p className="text-blue-900">
                  <strong>Subject:</strong> Data Deletion Request
                </p>
                <p className="text-blue-900">
                  <strong>Response Time:</strong> Within 30 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />
      
      <div className="text-center text-gray-600">
        <p>
          {t.raw('sections.legalBasis.items')[3]}
        </p>
      </div>
    </div>
  )
}
