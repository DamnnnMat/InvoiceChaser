import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AppShell from '@/components/layout/AppShell'
import WalkthroughProvider from '@/components/onboarding/WalkthroughProvider'
import { Toaster } from '@/components/ui/toaster'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get walkthrough status and trial info
  const adminSupabase = createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('has_seen_walkthrough, trial_ends_at')
    .eq('id', user.id)
    .single()

  // Get subscription for trial banner
  const { data: subscription } = await adminSupabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single()

  const hasSeenWalkthrough = profile?.has_seen_walkthrough ?? false

  return (
    <WalkthroughProvider hasSeenWalkthrough={hasSeenWalkthrough}>
      <AppShell 
        trialEndsAt={profile?.trial_ends_at || null}
        subscription={subscription}
      >
        {children}
      </AppShell>
      <Toaster />
    </WalkthroughProvider>
  )
}
