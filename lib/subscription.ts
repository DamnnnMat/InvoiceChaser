/**
 * Utility functions for checking user access (trial or subscription)
 */

export interface UserAccess {
  hasAccess: boolean
  isTrial: boolean
  isActiveSubscription: boolean
  trialEndsAt: string | null
  daysRemaining: number | null
  isExpired: boolean
}

/**
 * Check if user has access (either active trial or active subscription)
 */
export function checkUserAccess(
  trialEndsAt: string | null,
  subscription: { status: string; current_period_end: string | null } | null
): UserAccess {
  const now = new Date()
  const hasActiveSubscription = subscription?.status === 'active'
  
  // If has active subscription, always grant access
  if (hasActiveSubscription) {
    return {
      hasAccess: true,
      isTrial: false,
      isActiveSubscription: true,
      trialEndsAt: null,
      daysRemaining: null,
      isExpired: false,
    }
  }

  // Check trial
  if (trialEndsAt) {
    const trialEnd = new Date(trialEndsAt)
    const isExpired = trialEnd < now
    const daysRemaining = isExpired 
      ? 0 
      : Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      hasAccess: !isExpired,
      isTrial: true,
      isActiveSubscription: false,
      trialEndsAt,
      daysRemaining: isExpired ? 0 : daysRemaining,
      isExpired,
    }
  }

  // No trial, no subscription
  return {
    hasAccess: false,
    isTrial: false,
    isActiveSubscription: false,
    trialEndsAt: null,
    daysRemaining: null,
    isExpired: true,
  }
}
