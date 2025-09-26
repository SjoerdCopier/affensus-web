"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLocaleTranslations } from '@/hooks/use-locale-translations'
import { Button } from "@/components/ui/button"
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
  const [lastUsedMethod, setLastUsedMethod] = useState<string | null>(null)

  // Load last used method from localStorage on component mount
  useEffect(() => {
    const savedMethod = localStorage.getItem('lastLoginMethod')
    if (savedMethod) {
      setLastUsedMethod(savedMethod)
    }
  }, [])

  // Helper function to save login method to localStorage
  const saveLoginMethod = (method: string) => {
    localStorage.setItem('lastLoginMethod', method)
    setLastUsedMethod(method)
  }

  // Helper function to get display name for login method
  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'email': return t('auth.buttons.continueWithEmail')
      case 'google': return t('auth.buttons.continueWithGoogle')
      case 'github': return t('auth.buttons.continueWithGithub')
      case 'facebook': return 'Continue with Facebook' // Add to translations if needed
      default: return method
    }
  }

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

      saveLoginMethod('email')
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
        saveLoginMethod('google')
      } else if (provider === 'facebook') {
        oauthUrl = '/api/auth/facebook'
        saveLoginMethod('facebook')
      } else if (provider === 'github') {
        oauthUrl = '/api/auth/github'
        saveLoginMethod('github')
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
      <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-2">
        {/* Left Column - Magic Link Sent */}
        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="w-full max-w-sm lg:w-96 text-center">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <Image
                src="/images/affensus-logo.svg"
                alt="Affensus"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>

            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-green-600" />
            </div>

            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('auth.magicLink.title')}</h2>
            <p className="text-gray-600 mb-6">
              {t('auth.magicLink.description').replace('{email}', email)}
            </p>

            {/* Instructions */}
            <p className="text-sm text-gray-600 mb-8">
              {t('auth.magicLink.instructions').replace('{action}', isSignUp ? t('auth.signUp.title').toLowerCase() : t('auth.signIn.title').toLowerCase())}
            </p>

            {/* Back Button */}
            <Button 
              variant="outline" 
              className="w-full h-12 border-gray-300 hover:bg-gray-50" 
              onClick={() => setMagicLinkSent(false)}
            >
              {t('auth.magicLink.backButton')}
            </Button>
          </div>
        </div>

        {/* Right Column - Same testimonial section */}
        <div className="hidden lg:block relative" style={{ backgroundColor: '#274539' }}>
          <div className="flex items-center justify-center h-full p-12">
            <div className="max-w-md text-center">
              {/* Testimonial Quote */}
              <blockquote className="text-white text-xl font-medium leading-relaxed mb-8">
                &ldquo;Affensus has completely changed how we manage affiliate marketing. It&rsquo;s fast, intuitive, and gives us clear insights that actually matter.&rdquo;
              </blockquote>
              
              {/* Customer Info */}
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">JT</span>
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">Jacob Trummer</div>
                  <div className="text-gray-400 text-sm">COO – Saleduck Asia</div>
                </div>
              </div>

              {/* Features List */}
              <div className="mt-12 space-y-4 text-left">
                <div className="flex items-center text-white">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: t('auth.features.startForFree').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
                </div>
                <div className="flex items-center text-white">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: t('auth.features.noCreditCard').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
                </div>
                <div className="flex items-center text-white">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: t('auth.features.dayRefund').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
                </div>
                <div className="flex items-center text-white">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: t('auth.features.respectPrivacy').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
                </div>
                <div className="flex items-center text-white">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: t('auth.features.happyCustomers').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-2">
      {/* Left Column - Auth Form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/images/affensus-logo.svg"
              alt="Affensus"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? t('auth.signUp.title') : t('auth.signIn.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp ? t('auth.signUp.description') : t('auth.signIn.description')}
            </p>
          </div>

          {/* Auth Form */}
          <div className="space-y-6">
            {!showEmailInput ? (
              <>
                {/* Last Used Method Indicator */}
                {lastUsedMethod && (
                  <div className="text-center text-sm text-gray-600 mb-4">
                    <span className="bg-green-50 px-3 py-1 rounded-full text-xs font-medium" style={{ color: '#274539' }}>
                      Last used: {getMethodDisplayName(lastUsedMethod)}
                    </span>
                  </div>
                )}

                {/* Login Buttons - Prioritize last used method */}
                {lastUsedMethod === 'email' ? (
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-left justify-start border-green-300 bg-green-50 hover:bg-green-100" 
                    onClick={handleEmailButtonClick}
                    style={{ borderColor: '#6ca979', backgroundColor: '#f0fdf4' }}
                  >
                    <Mail className="w-5 h-5 mr-3" style={{ color: '#6ca979' }} />
                    <span className="font-medium" style={{ color: '#274539' }}>{t('auth.buttons.continueWithEmail')}</span>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-left justify-start border-gray-300 hover:bg-gray-50" 
                    onClick={handleEmailButtonClick}
                  >
                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">{t('auth.buttons.continueWithEmail')}</span>
                  </Button>
                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">Or</span>
                  </div>
                </div>

                {/* OAuth Buttons */}
                {lastUsedMethod === 'google' ? (
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-left justify-start border-green-300 bg-green-50 hover:bg-green-100" 
                    onClick={() => handleOAuth("google")}
                    style={{ borderColor: '#6ca979', backgroundColor: '#f0fdf4' }}
                  >
                    <Chrome className="w-5 h-5 mr-3" style={{ color: '#6ca979' }} />
                    <span className="font-medium" style={{ color: '#274539' }}>{t('auth.buttons.continueWithGoogle')}</span>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-left justify-start border-gray-300 hover:bg-gray-50" 
                    onClick={() => handleOAuth("google")}
                  >
                    <Chrome className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">{t('auth.buttons.continueWithGoogle')}</span>
                  </Button>
                )}

                {lastUsedMethod === 'github' ? (
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-left justify-start border-green-300 bg-green-50 hover:bg-green-100" 
                    onClick={() => handleOAuth("github")}
                    style={{ borderColor: '#6ca979', backgroundColor: '#f0fdf4' }}
                  >
                    <Github className="w-5 h-5 mr-3" style={{ color: '#6ca979' }} />
                    <span className="font-medium" style={{ color: '#274539' }}>{t('auth.buttons.continueWithGithub')}</span>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-left justify-start border-gray-300 hover:bg-gray-50" 
                    onClick={() => handleOAuth("github")}
                  >
                    <Github className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">{t('auth.buttons.continueWithGithub')}</span>
                  </Button>
                )}
              </>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {t('auth.form.emailLabel')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.form.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
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
          </div>
        </div>
      </div>

      {/* Right Column - Testimonial/Image Section */}
      <div className="hidden lg:block relative" style={{ backgroundColor: '#274539' }}>
        <div className="flex items-center justify-center h-full p-12">
          <div className="max-w-md text-center">
            {/* Testimonial Quote */}
            <blockquote className="text-white text-xl font-medium leading-relaxed mb-8">
              &ldquo;Affensus has completely changed how we manage affiliate marketing. It&rsquo;s fast, intuitive, and gives us clear insights that actually matter.&rdquo;
            </blockquote>
            
            {/* Customer Info */}
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">SK</span>
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">Sarah Kim</div>
                <div className="text-gray-400 text-sm">Customer Experience Manager – TechWave Inc.</div>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-12 space-y-4 text-left">
              <div className="flex items-center text-white">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: t('auth.features.startForFree').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
              </div>
              <div className="flex items-center text-white">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: t('auth.features.noCreditCard').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
              </div>
              <div className="flex items-center text-white">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: t('auth.features.dayRefund').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
              </div>
              <div className="flex items-center text-white">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: t('auth.features.respectPrivacy').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
              </div>
              <div className="flex items-center text-white">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: t('auth.features.happyCustomers').replace('{strong}', '<strong>').replace('{/strong}', '</strong>') }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
