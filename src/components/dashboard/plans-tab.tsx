"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Star } from "lucide-react"

// Simplified plan interface
interface Plan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  billing: string
  features: string[]
  excludes?: string[]
  popular: boolean
}

interface PlansTabProps {
  currentLocale?: string
  userSubscriptionStatus?: string
}

export default function PlansTab({ userSubscriptionStatus = 'free' }: PlansTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simplified plans data
  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individuals getting started',
      price: 9.99,
      currency: 'USD',
      billing: 'monthly',
      features: [
        'Basic affiliate link checking',
        'Up to 100 links per month',
        'Email support',
        'Basic analytics'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'Best for growing businesses',
      price: 29.99,
      currency: 'USD',
      billing: 'monthly',
      features: [
        'Advanced affiliate link checking',
        'Unlimited links',
        'Priority support',
        'Advanced analytics',
        'Network uptime monitoring',
        'Custom reports'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: 99.99,
      currency: 'USD',
      billing: 'monthly',
      features: [
        'Everything in Professional',
        'White-label solution',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee'
      ],
      popular: false
    }
  ]

  const getCurrentPlan = () => {
    return plans.find(plan => {
      if (plan.id === 'starter' && userSubscriptionStatus === 'basic') return true
      if (plan.id === 'pro' && userSubscriptionStatus === 'active') return true
      if (plan.id === 'enterprise' && userSubscriptionStatus === 'enterprise') return true
      return false
    })
  }

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // This would typically redirect to Stripe checkout
      console.log('Subscribing to plan:', planId)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch {
      setError('Failed to process subscription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const currentPlan = getCurrentPlan()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">
          Select the plan that best fits your affiliate marketing needs
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id
          const isFreePlan = plan.id === 'free'

          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''} ${isCurrentPlan ? 'bg-blue-50' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-500">/{plan.billing}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.excludes?.map((exclude, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-500">{exclude}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : isFreePlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Free Forever
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Subscribe'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>All plans include a 30-day money-back guarantee</p>
        <p>Need a custom solution? <a href="mailto:support@affensus.com" className="text-blue-500 hover:underline">Contact us</a></p>
      </div>
    </div>
  )
}