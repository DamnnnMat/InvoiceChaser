'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, X, CreditCard, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PageHeader from '@/components/layout/PageHeader'
import { checkUserAccess } from '@/lib/subscription'
import { formatDistanceToNow } from 'date-fns'

interface Subscription {
  id: string
  status: string
  current_period_end: string | null
  stripe_subscription_id: string
}

export default function BillingClient({
  userId,
  subscription,
  trialEndsAt,
}: {
  userId: string
  subscription: Subscription | null
  trialEndsAt: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')
  const [loading, setLoading] = useState(false)

  const access = checkUserAccess(trialEndsAt, subscription)

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        router.push('/app/dashboard')
      }, 2000)
    }
  }, [success, router])

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
      })
      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Failed to create checkout session', error)
      alert('Failed to create checkout session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status: string): 'default' | 'destructive' | 'secondary' => {
    if (status === 'active') return 'default'
    if (status === 'canceled' || status === 'past_due') return 'destructive'
    return 'secondary'
  }

  return (
    <>
      <PageHeader
        title="Billing"
        description="Manage your subscription and payment details"
      />

      <div className="p-8">
        {success && (
          <Card className="mb-6 border-green-200 bg-green-50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <p>Payment successful! Redirecting to invoices...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {canceled && (
          <Card className="mb-6 border-red-200 bg-red-50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <X className="h-5 w-5" />
                <p>Payment canceled. You can try again below.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="max-w-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-slate-600" />
              <CardTitle>Subscription Plan</CardTitle>
            </div>
            <CardDescription>
              Choose a plan that works for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">InvoiceSeen Pro</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-primary">£9</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </div>

              <ul className="space-y-2">
                {[
                  'Unlimited invoices',
                  'Automated reminders',
                  'Custom email templates',
                  'Reminder history tracking',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trial Status */}
            {access.isTrial && !access.isExpired && (
              <div className="space-y-4 border-t border-slate-200 pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Free Trial Active</span>
                    <Badge variant="secondary" className="ml-auto">
                      {access.daysRemaining} {access.daysRemaining === 1 ? 'day' : 'days'} left
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">
                    Your trial ends {formatDistanceToNow(new Date(access.trialEndsAt!), { addSuffix: true })}.
                    Subscribe now to continue using InvoiceSeen after your trial.
                  </p>
                  <Button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {loading ? 'Loading...' : 'Subscribe Now - £9/month'}
                  </Button>
                </div>
              </div>
            )}

            {/* Trial Expired */}
            {access.isTrial && access.isExpired && (
              <div className="space-y-4 border-t border-slate-200 pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-900">Trial Expired</span>
                  </div>
                  <p className="text-sm text-red-700 mb-4">
                    Your free trial has ended. Subscribe now to continue using InvoiceSeen and keep access to your data.
                  </p>
                  <Button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="lg"
                  >
                    {loading ? 'Loading...' : 'Subscribe Now - £9/month'}
                  </Button>
                </div>
              </div>
            )}

            {/* Subscription Status */}
            {access.isActiveSubscription && subscription && (
              <div className="space-y-4 border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Status</span>
                  <Badge variant={getStatusVariant(subscription.status)}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                </div>
                {subscription.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Renews on</span>
                    <span className="text-sm text-slate-900">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* No Trial, No Subscription */}
            {!access.hasAccess && !access.isTrial && (
              <div className="border-t border-slate-200 pt-6">
                <p className="text-sm text-slate-600 mb-4">
                  You don't have an active subscription.
                </p>
                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Loading...' : 'Subscribe Now - £9/month'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
