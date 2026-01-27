import { SupabaseClient } from '@supabase/supabase-js'
import { checkUserAccess } from './subscription'

/**
 * Server-side helper to check user access (trial or subscription)
 */
export async function getUserAccess(
  adminSupabase: SupabaseClient,
  userId: string
) {
  // Get subscription
  const { data: subscription } = await adminSupabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .single()

  // Get trial info
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('trial_ends_at')
    .eq('id', userId)
    .single()

  return checkUserAccess(profile?.trial_ends_at || null, subscription)
}
