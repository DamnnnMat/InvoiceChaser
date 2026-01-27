import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserAccess } from '@/lib/subscription-server'
import InvoicesClient from '@/components/invoices/InvoicesClient'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminSupabase = createAdminClient()
  
  // Check access (trial or subscription)
  const access = await getUserAccess(adminSupabase, user.id)

  // Get invoices with reminder aggregates
  const { data: invoices } = await adminSupabase
    .from('invoices')
    .select(`
      *,
      reminders:reminders(
        opened_at,
        open_count,
        sent_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Process invoices to add behavioral status data
  const invoicesWithBehavior = (invoices || []).map(invoice => {
    const reminders = invoice.reminders || []
    const hasReminders = reminders.length > 0
    const openedReminders = reminders.filter((r: any) => r.opened_at !== null)
    const hasOpens = openedReminders.length > 0
    const lastOpenedAt = hasOpens 
      ? reminders.reduce((latest: string | null, r: any) => {
          if (r.opened_at && (!latest || new Date(r.opened_at) > new Date(latest))) {
            return r.opened_at
          }
          return latest
        }, null)
      : null
    const totalOpenCount = reminders.reduce((sum: number, r: any) => sum + (r.open_count || 0), 0)
    
    return {
      ...invoice,
      reminders: undefined, // Remove full reminders array to reduce payload
      behaviorData: {
        hasReminders,
        hasOpens,
        lastOpenedAt,
        totalOpenCount,
      }
    }
  })

  return <InvoicesClient invoices={invoicesWithBehavior} hasAccess={access.hasAccess} accessInfo={access} />
}
