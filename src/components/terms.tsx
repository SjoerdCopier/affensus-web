"use client"

import Breadcrumbs from "@/components/breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocaleTranslations } from '@/hooks/use-locale-translations'
import { FileText, Calendar, Shield, AlertTriangle } from "lucide-react"

export default function TermsPage() {
  const { t: tBase } = useLocaleTranslations()
  
  // Helper function to get translations from messages
  const t = (key: string) => {
    const translation = tBase(`terms.${key}`)
    if (translation !== `terms.${key}`) {
      return translation
    }
    
    // Fallback translations
    const fallbacks: { [key: string]: string } = {
      'title': 'Terms of Service',
      'subtitle': 'Please read these terms carefully before using our service',
      'breadcrumb': 'Terms',
      'lastUpdated': 'Last Updated',
      'sections.agreementToTerms.title': 'Agreement to Terms',
      'sections.agreementToTerms.paragraph1': 'By accessing and using Affensus services, you accept and agree to be bound by the terms and provision of this agreement.',
      'sections.agreementToTerms.paragraph2': 'If you do not agree to abide by the above, please do not use this service.',
      'sections.serviceDescription.title': 'Description of Service',
      'sections.serviceDescription.intro': 'Affensus provides AI-powered solutions and tools including:',
      'sections.serviceDescription.reserveRight': 'We reserve the right to modify, suspend, or discontinue any part of our service at any time.',
      'sections.userAccounts.title': 'User Accounts',
      'sections.userAccounts.paragraph1': 'When you create an account with us, you must provide information that is accurate, complete, and current at all times.',
      'sections.userAccounts.paragraph2': 'You are responsible for safeguarding the password and for all activities that occur under your account.',
      'sections.acceptableUse.title': 'Acceptable Use',
      'sections.acceptableUse.intro': 'You agree not to use the service to:',
      'sections.intellectualProperty.title': 'Intellectual Property',
      'sections.intellectualProperty.paragraph1': 'The service and its original content, features, and functionality are and will remain the exclusive property of Affensus.',
      'sections.intellectualProperty.paragraph2': 'The service is protected by copyright, trademark, and other laws.',
      'sections.privacy.title': 'Privacy',
      'sections.privacy.content': 'Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.',
      'sections.termination.title': 'Termination',
      'sections.termination.paragraph1': 'We may terminate or suspend your account and bar access to the service immediately, without prior notice.',
      'sections.termination.paragraph2': 'Upon termination, your right to use the service will cease immediately.',
      'sections.disclaimers.title': 'Disclaimers',
      'sections.disclaimers.content': 'The service is provided on an "AS IS" and "AS AVAILABLE" basis. Affensus makes no warranties, expressed or implied.',
      'sections.limitationOfLiability.title': 'Limitation of Liability',
      'sections.limitationOfLiability.content': 'In no event shall Affensus be liable for any indirect, incidental, special, consequential, or punitive damages.',
      'sections.governingLaw.title': 'Governing Law',
      'sections.governingLaw.content': 'These terms shall be interpreted and governed by the laws of the jurisdiction in which Affensus operates.',
      'sections.changesToTerms.title': 'Changes to Terms',
      'sections.changesToTerms.paragraph1': 'We reserve the right to modify or replace these terms at any time.',
      'sections.changesToTerms.paragraph2': 'If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.',
      'sections.contactInformation.title': 'Contact Information',
      'sections.contactInformation.intro': 'If you have any questions about these Terms of Service, please contact us:',
      'sections.contactInformation.company': 'Affensus',
      'sections.contactInformation.address': '123 Business Street, Suite 100, City, State 12345',
      'sections.contactInformation.email': 'legal@affensus.com'
    }
    return fallbacks[key] || key
  }

  // Add raw method to handle arrays
  t.raw = (key: string) => {
    // Try to get translation from the hook
    const translation = tBase(`terms.${key}`)
    if (translation !== `terms.${key}` && Array.isArray(translation)) {
      return translation
    }
    
    // Fallback arrays
    const fallbackArrays: { [key: string]: string[] } = {
      'sections.serviceDescription.features': [
        'AI-powered business solutions',
        'Affiliate marketing tools',
        'Analytics and reporting',
        'Custom integrations'
      ],
      'sections.acceptableUse.prohibitedActivities': [
        'Violate any applicable laws or regulations',
        'Infringe upon intellectual property rights',
        'Transmit harmful or malicious code',
        'Attempt to gain unauthorized access to our systems'
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
                href: "/terms",
                current: true,
              },
            ]}
          />
        </div>
        
        {/* Header Section */}
        <section className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
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
                <Shield className="h-5 w-5" />
                1. {t('sections.agreementToTerms.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.agreementToTerms.paragraph1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.agreementToTerms.paragraph2')}
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>2. {t('sections.serviceDescription.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.serviceDescription.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                {t.raw('sections.serviceDescription.features').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.serviceDescription.reserveRight')}
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>3. {t('sections.userAccounts.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.userAccounts.paragraph1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.userAccounts.paragraph2')}
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                4. {t('sections.acceptableUse.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.acceptableUse.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                {t.raw('sections.acceptableUse.prohibitedActivities').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>5. {t('sections.intellectualProperty.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.intellectualProperty.paragraph1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.intellectualProperty.paragraph2')}
              </p>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>6. {t('sections.privacy.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.privacy.content')}
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>7. {t('sections.termination.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.termination.paragraph1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.termination.paragraph2')}
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>8. {t('sections.disclaimers.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.disclaimers.content')}
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>9. {t('sections.limitationOfLiability.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.limitationOfLiability.content')}
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>10. {t('sections.governingLaw.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.governingLaw.content')}
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>11. {t('sections.changesToTerms.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.changesToTerms.paragraph1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.changesToTerms.paragraph2')}
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>12. {t('sections.contactInformation.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.contactInformation.intro')}
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">{t('sections.contactInformation.company')}</p>
                <p className="text-muted-foreground">
                  {t('sections.contactInformation.address')}
                </p>
                <p className="text-muted-foreground mt-2">
                  {t('sections.contactInformation.email')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
