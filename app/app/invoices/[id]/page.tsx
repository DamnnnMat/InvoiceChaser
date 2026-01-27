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

  // Get payments
  const { data: payments } = await adminSupabase
    .from('invoice_payments')
    .select('*')
    .eq('invoice_id', params.id)
    .order('paid_at', { ascending: false })

  // Compute totals
  const totalPaid = payments?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const invoiceAmountCents = Math.round(invoice.amount * 100)
  const outstandingCents = invoiceAmountCents - totalPaid
  const outstanding = outstandingCents / 100

  // Find last seen (latest opened_at from reminders)
  const lastSeen = reminders
    ?.filter(r => r.opened_at)
    .map(r => r.opened_at!)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null

  // Check if overdue
  const dueDate = new Date(invoice.due_date)
  const now = new Date()
  const isOverdue = dueDate < now && outstanding > 0

  // Build unified timeline
  type TimelineEvent = {
    id: string
    type: 'invoice_created' | 'reminder_sent' | 'reminder_opened' | 'reminder_failed' | 'payment_received' | 'marked_paid'
    title: string
    timestamp: string
    meta?: any
    status?: 'success' | 'warning' | 'error' | 'info'
  }

  const timelineEvents: TimelineEvent[] = []

  // Add invoice created event
  timelineEvents.push({
    id: `invoice-${invoice.id}`,
    type: 'invoice_created',
    title: 'Invoice created',
    timestamp: invoice.created_at,
    status: 'info',
  })

  // Add reminder events
  reminders?.forEach((reminder) => {
    // Add sent event
    timelineEvents.push({
      id: `reminder-sent-${reminder.id}`,
      type: reminder.status === 'sent' ? 'reminder_sent' : 'reminder_failed',
      title: reminder.status === 'sent' ? 'Reminder sent' : 'Failed to send',
      timestamp: reminder.sent_at,
      meta: {
        reminder_type: reminder.reminder_type,
        error_message: reminder.error_message,
      },
      status: reminder.status === 'sent' ? 'success' : 'error',
    })

    // Add opened event if exists
    if (reminder.opened_at) {
      // Determine title based on outstanding amount
      const openedTitle = outstanding > 0 
        ? 'Reminder opened · Unpaid'
        : 'Reminder opened'
      
      timelineEvents.push({
        id: `reminder-opened-${reminder.id}`,
        type: 'reminder_opened',
        title: openedTitle,
        timestamp: reminder.opened_at,
        meta: {
          open_count: reminder.open_count || 1,
          reminder_type: reminder.reminder_type,
          first_opened_at: reminder.opened_at, // Store first open time
        },
        status: 'success',
      })
    }
  })

  // Add payment events
  payments?.forEach((payment) => {
    timelineEvents.push({
      id: `payment-${payment.id}`,
      type: 'payment_received',
      title: `Payment received: £${(payment.amount_cents / 100).toFixed(2)}`,
      timestamp: payment.paid_at,
      meta: {
        amount_cents: payment.amount_cents,
        note: payment.note,
      },
      status: 'success',
    })
  })

  // Add marked paid event if outstanding is 0
  // Show if invoice.is_paid is true OR if payments fully cover the invoice
  if (outstanding === 0 && (invoice.is_paid || totalPaid >= invoiceAmountCents)) {
    // Find the latest payment or invoice update timestamp
    const latestPayment = payments?.[0]?.paid_at
    const markedPaidTimestamp = invoice.is_paid 
      ? (invoice.updated_at || invoice.created_at)
      : (latestPayment || invoice.updated_at || invoice.created_at)
    
    timelineEvents.push({
      id: `marked-paid-${invoice.id}`,
      type: 'marked_paid',
      title: 'Marked paid',
      timestamp: markedPaidTimestamp,
      status: 'success',
    })
  }

  // Sort by timestamp DESC
  timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <InvoiceDetailClient
      invoice={invoice}
      reminders={reminders || []}
      payments={payments || []}
      timelineEvents={timelineEvents}
      totalPaid={totalPaid / 100}
      outstanding={outstanding}
      lastSeen={lastSeen}
      isOverdue={isOverdue}
    />
  )
}
