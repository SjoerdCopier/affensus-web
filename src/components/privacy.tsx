"use client"

import Breadcrumbs from "@/components/breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { useLocaleTranslations } from '@/hooks/use-locale-translations'
import { 
  Shield, 
  Calendar, 
  Eye, 
  Cookie, 
  Database, 
  Lock, 
  Users, 
  Globe,

  Mail,
  Settings,
  AlertTriangle
} from "lucide-react"

export default function PrivacyPage() {
  const { t: tBase } = useLocaleTranslations()
  
  // Helper function to get translations from messages
  const t = (key: string) => {
    const translation = tBase(`privacy.${key}`)
    if (translation !== `privacy.${key}`) {
      return translation
    }
    
    // Fallback translations
    const fallbacks: { [key: string]: string } = {
      'title': 'Privacy Policy',
      'subtitle': 'How we collect, use, and protect your information',
      'breadcrumb': 'Privacy',
      'lastUpdated': 'Last Updated',
      'sections.introduction.title': 'Introduction',
      'sections.introduction.paragraph1': 'This Privacy Policy describes how Affensus collects, uses, and protects your personal information.',
      'sections.introduction.paragraph2': 'By using our service, you agree to the collection and use of information in accordance with this policy.',
      'sections.introduction.gdprCompliance': 'We are committed to GDPR compliance and protecting your privacy rights.',
      'sections.informationWeCollect.title': 'Information We Collect',
      'sections.informationWeCollect.personalInformation.title': 'Personal Information',
      'sections.informationWeCollect.personalInformation.intro': 'We may collect personal information that you provide directly to us:'
    }
    return fallbacks[key] || key
  }

  // Add raw method to handle arrays
  t.raw = (key: string) => {
    // Try to get translation from the hook
    const translation = tBase(`privacy.${key}`)
    if (translation !== `privacy.${key}` && Array.isArray(translation)) {
      return translation
    }
    
    // Fallback arrays
    const fallbackArrays: { [key: string]: string[] } = {
      'sections.informationWeCollect.personalInformation.items': [
        'Name and contact information',
        'Email address',
        'Account credentials',
        'Profile information'
      ],
      'sections.informationWeCollect.usageInformation.items': [
        'Learning progress and preferences',
        'Feature usage patterns',
        'Device and browser information',
        'Performance and error data'
      ],
      'sections.informationWeCollect.mobileAppData.items': [
        'Device identifiers',
        'App usage statistics',
        'Crash reports and diagnostics',
        'Push notification preferences'
      ],
      'sections.cookiesAndTracking.essentialCookies.items': [
        'Session management',
        'Security and authentication',
        'Language preferences',
        'Basic functionality'
      ],
      'sections.cookiesAndTracking.analyticsCookies.items': [
        'Usage analytics',
        'Performance monitoring',
        'Feature optimization',
        'User experience improvements'
      ],
      'sections.dataSharing.thirdPartyServices.items': [
        'Google Analytics for usage statistics',
        'Cloudflare for security and performance',
        'Payment processors for transactions',
        'Email service providers for communications'
      ],
      'sections.dataRetention.retentionPeriods.items': [
        'Account data: Until account deletion',
        'Usage data: 2 years',
        'Analytics data: 26 months',
        'Support communications: 3 years'
      ],
      'sections.internationalTransfers.safeguards.items': [
        'Standard Contractual Clauses (SCCs)',
        'Adequacy decisions by relevant authorities',
        'Certification schemes and codes of conduct',
        'Binding corporate rules where applicable'
      ],
      'sections.changesToPolicy.notificationOfChanges.items': [
        'Email notifications to registered users',
        'In-app notifications and banners',
        'Updated privacy policy page',
        'Social media announcements for major changes'
      ]
    }
    return fallbackArrays[key] || []
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-4 pb-16 space-y-12">
        
        {/* Breadcrumbs */}
        <div>
          <Breadcrumbs
            items={[
              {
                label: t('breadcrumb'),
                href: "/privacy",
                current: true,
              },
            ]}
          />
        </div>
        
        {/* Header Section */}
        <section className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">{t('title')}</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t('lastUpdated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </section>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                1. {t('sections.introduction.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.introduction.paragraph1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.introduction.paragraph2')}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t('sections.introduction.gdprCompliance')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                2. {t('sections.informationWeCollect.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-medium">{t('sections.informationWeCollect.personalInformation.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.informationWeCollect.personalInformation.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                {t.raw('sections.informationWeCollect.personalInformation.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h4 className="font-medium mt-4">{t('sections.informationWeCollect.usageInformation.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.informationWeCollect.usageInformation.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                {t.raw('sections.informationWeCollect.usageInformation.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h4 className="font-medium mt-4">{t('sections.informationWeCollect.mobileAppData.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.informationWeCollect.mobileAppData.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                {t.raw('sections.informationWeCollect.mobileAppData.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                3. {t('sections.howWeUseInformation.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.howWeUseInformation.paragraph1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.howWeUseInformation.paragraph2')}
              </p>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                4. {t('sections.cookiesAndTracking.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-medium">{t('sections.cookiesAndTracking.essentialCookies.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.cookiesAndTracking.essentialCookies.intro')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                {t.raw('sections.cookiesAndTracking.essentialCookies.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h4 className="font-medium mt-4">{t('sections.cookiesAndTracking.analyticsCookies.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.cookiesAndTracking.analyticsCookies.intro')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                {t.raw('sections.cookiesAndTracking.analyticsCookies.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h4 className="font-medium mt-4">{t('sections.cookiesAndTracking.cookieManagement.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.cookiesAndTracking.cookieManagement.content')}
              </p>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                5. {t('sections.dataSharing.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-medium">{t('sections.dataSharing.thirdPartyServices.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.dataSharing.thirdPartyServices.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                {t.raw('sections.dataSharing.thirdPartyServices.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h4 className="font-medium mt-4">{t('sections.dataSharing.legalRequirements.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.dataSharing.legalRequirements.content')}
              </p>
              
              <h4 className="font-medium mt-4">{t('sections.dataSharing.businessTransfers.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.dataSharing.businessTransfers.content')}
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {t('sections.dataSharing.noSaleNotice')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                6. {t('sections.dataSecurity.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.dataSecurity.paragraph1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.dataSecurity.paragraph2')}
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                7. {t('sections.yourRights.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-medium">{t('sections.yourRights.gdprRights.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.yourRights.gdprRights.paragraph1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.yourRights.gdprRights.paragraph2')}
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>8. {t('sections.dataRetention.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-medium">{t('sections.dataRetention.retentionPeriods.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.dataRetention.retentionPeriods.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                {t.raw('sections.dataRetention.retentionPeriods.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h4 className="font-medium mt-4">{t('sections.dataRetention.deletionProcedures.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.dataRetention.deletionProcedures.content')}
              </p>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                9. {t('sections.internationalTransfers.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-medium">{t('sections.internationalTransfers.crossBorderProcessing.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.internationalTransfers.crossBorderProcessing.content')}
              </p>
              
              <h4 className="font-medium mt-4">{t('sections.internationalTransfers.safeguards.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.internationalTransfers.safeguards.intro')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                {t.raw('sections.internationalTransfers.safeguards.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>10. {t('sections.childrensPrivacy.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-medium">{t('sections.childrensPrivacy.ageRestrictions.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.childrensPrivacy.ageRestrictions.content')}
              </p>
              
              <h4 className="font-medium mt-4">{t('sections.childrensPrivacy.parentalControls.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.childrensPrivacy.parentalControls.content')}
              </p>
              
              <h4 className="font-medium mt-4">{t('sections.childrensPrivacy.educationalUse.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.childrensPrivacy.educationalUse.content')}
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>11. {t('sections.changesToPolicy.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-medium">{t('sections.changesToPolicy.policyUpdates.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.changesToPolicy.policyUpdates.content')}
              </p>
              
              <h4 className="font-medium mt-4">{t('sections.changesToPolicy.notificationOfChanges.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.changesToPolicy.notificationOfChanges.intro')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                {t.raw('sections.changesToPolicy.notificationOfChanges.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h4 className="font-medium mt-4">{t('sections.changesToPolicy.continuedUse.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.changesToPolicy.continuedUse.content')}
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                12. {t('sections.contactInformation.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-medium">{t('sections.contactInformation.privacyQuestions.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.contactInformation.privacyQuestions.intro')}
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">{t('sections.contactInformation.dataProtectionOfficer')}</p>
                <p className="font-medium">{t('sections.contactInformation.company')}</p>
                <p className="text-muted-foreground">
                  {t('sections.contactInformation.address')}
                </p>
                <p className="text-muted-foreground mt-2">
                  {t('sections.contactInformation.email')}<br />
                  {t('sections.contactInformation.subject')}
                </p>
              </div>
              
              <h4 className="font-medium mt-4">{t('sections.contactInformation.responseTime.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.contactInformation.responseTime.content')}
              </p>
              
              <h4 className="font-medium mt-4">{t('sections.contactInformation.supervisoryAuthority.title')}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.contactInformation.supervisoryAuthority.content')}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
