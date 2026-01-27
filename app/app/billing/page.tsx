import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import BillingClient from '@/components/billing/BillingClient'

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check subscription status and trial
  const adminSupabase = createAdminClient()
  const { data: subscription } = await adminSupabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get user profile for trial info
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('trial_started_at, trial_ends_at')
    .eq('id', user.id)
    .single()

  return (
    <BillingClient
      userId={user.id}
      subscription={subscription}
      trialEndsAt={profile?.trial_ends_at || null}
    />
  )
}
