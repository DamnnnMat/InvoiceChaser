import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const subscriptionId = session.subscription as string
      const customerId = session.customer as string

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      let userId = subscription.metadata.user_id
      
      if (!userId) {
        // Try to get from customer metadata
        const customer = await stripe.customers.retrieve(customerId as string)
        if (!customer.deleted && customer.metadata?.user_id) {
          userId = customer.metadata.user_id
        }
      }

      if (!userId) {
        // Try to find user by email
        const customer = await stripe.customers.retrieve(customerId as string)
        if (customer.deleted || !customer.email) {
          throw new Error('Could not identify user')
        }
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('id')
          .eq('email', customer.email)
          .single()

        if (!profile) {
          throw new Error('Could not identify user')
        }
        userId = profile.id
      }

      // Create or update subscription
      await adminSupabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId as string,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      
      await adminSupabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      
      await adminSupabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
