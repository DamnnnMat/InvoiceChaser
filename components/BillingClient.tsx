'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import './Billing.css'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Subscription {
  id: string
  status: string
  current_period_end: string | null
  stripe_subscription_id: string
}

export default function BillingClient({
  userId,
  subscription,
}: {
  userId: string
  subscription: Subscription | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (success) {
      // Redirect to invoices after successful payment (as per PRD)
      setTimeout(() => {
        router.push('/app/invoices')
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

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: '#10b981',
      canceled: '#ef4444',
      past_due: '#f59e0b',
    }
    return colors[status] || '#6b7280'
  }

  return (
    <div className="billing">
      <h1>Billing</h1>

      {success && (
        <div className="success-message">
          Payment successful! Redirecting to invoices...
        </div>
      )}

      {canceled && (
        <div className="error-message">
          Payment canceled. You can try again below.
        </div>
      )}

      <div className="card">
        <h2>Subscription Plan</h2>
        <div className="plan-details">
          <div className="plan-name">Invoice Chaser Pro</div>
          <div className="plan-price">£9<span>/month</span></div>
          <ul className="plan-features">
            <li>Unlimited invoices</li>
            <li>Automated reminders</li>
            <li>Custom email templates</li>
            <li>Reminder history tracking</li>
          </ul>
        </div>

        {subscription ? (
          <div className="subscription-info">
            <div className="info-item">
              <span className="label">Status:</span>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(subscription.status) }}
              >
                {subscription.status.charAt(0).toUpperCase() +
                  subscription.status.slice(1)}
              </span>
            </div>
            {subscription.current_period_end && (
              <div className="info-item">
                <span className="label">Renews on:</span>
                <span className="value">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>
            )}
            {subscription.status !== 'active' && (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Loading...' : 'Subscribe Now'}
              </button>
            )}
          </div>
        ) : (
          <div className="no-subscription">
            <p>You don't have an active subscription.</p>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Loading...' : 'Subscribe Now - £9/month'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
