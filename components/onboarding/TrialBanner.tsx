'use client'

import { Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { checkUserAccess } from '@/lib/subscription'

interface TrialBannerProps {
  trialEndsAt: string | null
  subscription: { status: string; current_period_end: string | null } | null
}

export default function TrialBanner({ trialEndsAt, subscription }: TrialBannerProps) {
  const access = checkUserAccess(trialEndsAt, subscription)

  // Don't show if user has active subscription
  if (access.isActiveSubscription) {
    return null
  }

  // Show trial active banner
  if (access.isTrial && !access.isExpired) {
    const daysRemaining = access.daysRemaining || 0
    
    return (
      <div className="border-b bg-blue-50 border-blue-200">
        <div className="max-w-7xl mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <span className="font-medium text-blue-900">
                  Free Trial Active
                </span>
                <span className="text-sm text-blue-700 ml-2">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                </span>
              </div>
            </div>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/app/billing">Subscribe Now</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show trial expired banner
  if (access.isTrial && access.isExpired) {
    return (
      <div className="border-b bg-red-50 border-red-200">
        <div className="max-w-7xl mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <span className="font-medium text-red-900">
                  Trial Expired
                </span>
                <span className="text-sm text-red-700 ml-2">
                  Subscribe to continue using InvoiceSeen and keep access to your data
                </span>
              </div>
            </div>
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
              <Link href="/app/billing">Subscribe Now</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
