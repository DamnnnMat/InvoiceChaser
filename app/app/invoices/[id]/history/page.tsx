import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import InvoiceHistoryClient from '@/components/invoices/InvoiceHistoryClient'

export default async function InvoiceHistoryPage({
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

  // Get templates for reminders that have template_id
  const templateIds = reminders
    ?.filter(r => r.template_id)
    .map(r => r.template_id)
    .filter((id): id is string => id !== null) || []

  let templates: { [key: string]: any } = {}
  if (templateIds.length > 0) {
    const { data: templateData } = await adminSupabase
      .from('email_templates')
      .select('*')
      .in('id', templateIds)
    
    if (templateData) {
      templateData.forEach(t => {
        templates[t.id] = t
      })
    }
  }

  // Attach template data to reminders
  const remindersWithTemplates = reminders?.map(reminder => ({
    ...reminder,
    template: reminder.template_id ? templates[reminder.template_id] || null : null,
  })) || []

  return <InvoiceHistoryClient invoice={invoice} reminders={remindersWithTemplates} />
}
