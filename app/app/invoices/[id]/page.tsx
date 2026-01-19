import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import InvoiceDetailClient from '@/components/invoices/InvoiceDetailClient'

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminSupabase = createAdminClient()
  
  // Get invoice
  const { data: invoice } = await adminSupabase
    .from('invoices')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!invoice) {
    redirect('/app/invoices')
  }

  // Get reminders
  const { data: reminders } = await adminSupabase
    .from('reminders')
    .select('*')
    .eq('invoice_id', params.id)
    .order('sent_at', { ascending: false })

  return <InvoiceDetailClient invoice={invoice} reminders={reminders || []} />
}
