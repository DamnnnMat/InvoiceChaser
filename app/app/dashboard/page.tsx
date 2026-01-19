import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminSupabase = createAdminClient()

  // Check subscription
  const { data: subscription } = await adminSupabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  // Get invoices
  const { data: invoices } = await adminSupabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get reminders - we'll join with invoices separately if needed
  // For now, get reminders and filter by user's invoices
  const { data: allReminders } = await adminSupabase
    .from('reminders')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(50)

  // Filter reminders to only those belonging to user's invoices
  const userInvoiceIds = (invoices || []).map(inv => inv.id)
  const reminders = (allReminders || []).filter(rem => 
    userInvoiceIds.includes(rem.invoice_id)
  ).slice(0, 10).map(rem => ({
    ...rem,
    invoices: invoices?.find(inv => inv.id === rem.invoice_id),
  }))

  return (
    <DashboardClient
      invoices={invoices || []}
      reminders={reminders || []}
      hasSubscription={!!subscription}
    />
  )
}
