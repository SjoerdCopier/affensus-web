"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLocaleTranslations } from '@/hooks/use-locale-translations'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Mail, Chrome, Zap, Check } from "lucide-react"
import { getLocalizedPath } from '@/lib/url-utils'

export default function AuthComponent() {
  const { t, currentLocale } = useLocaleTranslations()
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)

  // Helper function to generate locale-aware URLs
  const getLocalizedUrl = (path: string) => {
    // For default locale (English), don't add locale prefix
    if (currentLocale === 'en') {
      return path
    }
    // For other locales, add the locale prefix
    return getLocalizedPath(currentLocale, path)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Regular magic link flow
      const response = await fetch('/api/request-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send magic link')
      }

      setMagicLinkSent(true)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: string) => {
    try {
      let oauthUrl = ''
      if (provider === 'google') {
        oauthUrl = '/api/auth/google'
      } else if (provider === 'facebook') {
        oauthUrl = '/api/auth/facebook'
      } else if (provider === 'github') {
        oauthUrl = '/api/auth/github'
      } else {
        alert(`${provider} OAuth is not implemented yet. Please use magic link authentication.`)
        return
      }

      window.location.href = oauthUrl
    } catch {
      alert(`Failed to authenticate with ${provider}`)
    }
  }

  const handleEmailButtonClick = () => {
    setShowEmailInput(true)
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
        <Card className="w-full max-w-md relative z-10">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">{t('auth.magicLink.title')}</CardTitle>
            <CardDescription>
              {t('auth.magicLink.description').replace('{email}', email)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              {t('auth.magicLink.instructions').replace('{action}', isSignUp ? t('auth.signUp.title').toLowerCase() : t('auth.signIn.title').toLowerCase())}
            </div>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => setMagicLinkSent(false)}>
              {t('auth.magicLink.backButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/images/affensus-logo.svg"
              alt="Affensus"
              width={48}
              height={48}
              className="w-40 h-40"
            />
           
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? t('auth.signUp.title') : t('auth.signIn.title')}
          </CardTitle>
          <CardDescription>
            {isSignUp ? t('auth.signUp.description') : t('auth.signIn.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Primary Authentication Buttons - Fixed Height Container */}
          <div className="space-y-3 h-[280px] flex flex-col justify-center">
            {!showEmailInput ? (
              <>
                <Button variant="outline" className="w-full h-12 bg-transparent" onClick={handleEmailButtonClick}>
                  <div className="flex items-center w-full relative">
                    <div className="absolute left-0 w-8 flex justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-center">{t('auth.buttons.continueWithEmail')}</span>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:text-white" 
                  onClick={() => handleOAuth("google")}
                >
                  <div className="flex items-center w-full relative">
                    <div className="absolute left-0 w-8 flex justify-center">
                      <Chrome className="w-5 h-5" />
                    </div>
                                          <span className="flex-1 text-center">{t('auth.buttons.continueWithGoogle')}</span>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white hover:text-white border-gray-900" 
                  onClick={() => handleOAuth("github")}
                >
                  <div className="flex items-center w-full relative">
                    <div className="absolute left-0 w-8 flex justify-center">
                      <Github className="w-5 h-5" />
                    </div>
                                          <span className="flex-1 text-center">{t('auth.buttons.continueWithGithub')}</span>
                  </div>
                </Button>
              </>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.form.emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.form.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <Button type="submit" className="w-full h-12 bg-gray-900 hover:bg-gray-800" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {t('auth.buttons.sendingMagicLink')}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      {t('auth.buttons.sendMagicLink')}
                    </div>
                  )}
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full h-10 text-gray-600 hover:text-gray-800" 
                  onClick={() => setShowEmailInput(false)}
                >
                  {t('auth.buttons.backToAllOptions')}
                </Button>
              </form>
            )}
          </div>

          {/* Green Checkmarks */}
          <div className="space-y-3 pb-6">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Check className="w-5 h-5 text-green-600" />
              <span dangerouslySetInnerHTML={{ __html: t('auth.features.startForFree').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Check className="w-5 h-5 text-green-600" />
              <span dangerouslySetInnerHTML={{ __html: t('auth.features.noCreditCard').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Check className="w-5 h-5 text-green-600" />
              <span dangerouslySetInnerHTML={{ __html: t('auth.features.dayRefund').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Check className="w-5 h-5 text-green-600" />
              <span dangerouslySetInnerHTML={{ __html: t('auth.features.respectPrivacy').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Check className="w-5 h-5 text-green-600" />
              <span dangerouslySetInnerHTML={{ __html: t('auth.features.happyCustomers').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
            </div>
          </div>

          {/* Toggle Sign Up/Sign In */}
          <div className="text-center text-sm">
            <span className="text-gray-600">
              {isSignUp ? t('auth.toggleText.alreadyHaveAccount') : t('auth.toggleText.dontHaveAccount')}
            </span>{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-gray-900 underline hover:no-underline"
            >
              {isSignUp ? t('auth.buttons.signIn') : t('auth.buttons.signUp')}
            </button>
          </div>

          {/* Terms and Privacy */}
          {isSignUp && (
            <div className="text-xs text-gray-500 text-center">
              {t('auth.terms.byCreatingAccount')}<br />
              <Link href={getLocalizedUrl('/terms')} className="underline hover:text-gray-700">
                {t('auth.terms.termsOfService')}
              </Link>{" "}
              {t('auth.terms.and')}{" "}
              <Link href={getLocalizedUrl('/privacy')} className="underline hover:text-gray-700">
                {t('auth.terms.privacyPolicy')}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
