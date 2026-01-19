import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, etc.)
// It checks for unpaid invoices and sends reminders
export async function GET(request: NextRequest) {
  // Verify cron secret (for security)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const adminSupabase = createAdminClient()
    const now = new Date()

    // Get all unpaid invoices
    const { data: invoices } = await adminSupabase
      .from('invoices')
      .select('*')
      .eq('is_paid', false)

    if (!invoices || invoices.length === 0) {
      return NextResponse.json({ message: 'No unpaid invoices', processed: 0 })
    }

    let processed = 0
    let sent = 0
    let failed = 0

    for (const invoice of invoices) {
      processed++
      const dueDate = new Date(invoice.due_date)
      const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const daysOverdue = daysUntilDue < 0 ? Math.abs(daysUntilDue) : 0

      let reminderType: string | null = null
      let shouldSend = false

      // Before due date: 3 days before
      if (daysUntilDue === 3) {
        reminderType = 'before_due'
        shouldSend = true
      }
      // On due date
      else if (daysUntilDue === 0) {
        reminderType = 'on_due'
        shouldSend = true
      }
      // After due date: 7 days after, then every 7 days
      else if (daysOverdue > 0 && (daysOverdue === 7 || (daysOverdue > 7 && daysOverdue % 7 === 0))) {
        reminderType = 'after_due'
        shouldSend = true
      }

      if (shouldSend && reminderType) {
        // Check if we already sent this type today
        const todayStart = new Date(now.setHours(0, 0, 0, 0))
        const { data: existing } = await adminSupabase
          .from('reminders')
          .select('*')
          .eq('invoice_id', invoice.id)
          .eq('reminder_type', reminderType)
          .gte('sent_at', todayStart.toISOString())
          .limit(1)

        if (existing && existing.length > 0) {
          continue // Already sent today
        }

        // Get template
        const templateType = reminderType === 'before_due' ? 'friendly' : 
                            reminderType === 'on_due' ? 'firm' : 'final'

        const { data: template } = await adminSupabase
          .from('email_templates')
          .select('*')
          .eq('user_id', invoice.user_id)
          .eq('template_type', templateType)
          .single()

        if (!template) {
          // Use default template
          const defaults: { [key: string]: { subject: string; body: string } } = {
            friendly: {
              subject: 'Friendly Reminder: Invoice Payment Due',
              body: 'Hi {client_name}, Just a friendly reminder that your invoice for £{amount} is due on {due_date}. Thank you!',
            },
            firm: {
              subject: 'Reminder: Invoice Payment Overdue',
              body: 'Hi {client_name}, This is a reminder that your invoice for £{amount} was due on {due_date} and is now overdue. Please arrange payment as soon as possible.',
            },
            final: {
              subject: 'Final Notice: Urgent Payment Required',
              body: 'Hi {client_name}, This is a final notice regarding your overdue invoice for £{amount}, which was due on {due_date}. Please make payment immediately to avoid further action.',
            },
          }
          const defaultTemplate = defaults[templateType]
          
          // Send email
          const subject = defaultTemplate.subject.replace('{client_name}', invoice.client_name)
            .replace('{amount}', invoice.amount.toString())
            .replace('{due_date}', dueDate.toLocaleDateString())
          const body = defaultTemplate.body.replace('{client_name}', invoice.client_name)
            .replace('{amount}', invoice.amount.toString())
            .replace('{due_date}', dueDate.toLocaleDateString())

          try {
            // Generate tracking_id before sending
            const trackingId = crypto.randomUUID()
            const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/track/open?rid=${trackingId}" width="1" height="1" style="display:none;" alt="" />`
            
            // Convert text body to HTML and append tracking pixel
            const htmlBody = body.replace(/\n/g, '<br/>') + trackingPixel

            await resend.emails.send({
              from: process.env.EMAIL_FROM!,
              to: invoice.client_email,
              subject,
              text: body,
              html: htmlBody,
            })

            // Log reminder with tracking_id
            await adminSupabase.from('reminders').insert({
              invoice_id: invoice.id,
              reminder_type: reminderType,
              status: 'sent',
              tracking_id: trackingId,
            })
            sent++
          } catch (emailError) {
            // Log failed reminder
            await adminSupabase.from('reminders').insert({
              invoice_id: invoice.id,
              reminder_type: reminderType,
              status: 'failed',
              error_message: String(emailError),
            })
            failed++
          }
        } else {
          // Use custom template
          const subject = template.subject.replace('{client_name}', invoice.client_name)
            .replace('{amount}', invoice.amount.toString())
            .replace('{due_date}', dueDate.toLocaleDateString())
          const body = template.body.replace('{client_name}', invoice.client_name)
            .replace('{amount}', invoice.amount.toString())
            .replace('{due_date}', dueDate.toLocaleDateString())

          try {
            // Generate tracking_id before sending
            const trackingId = crypto.randomUUID()
            const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/track/open?rid=${trackingId}" width="1" height="1" style="display:none;" alt="" />`
            
            // Convert text body to HTML and append tracking pixel
            const htmlBody = body.replace(/\n/g, '<br/>') + trackingPixel

            await resend.emails.send({
              from: process.env.EMAIL_FROM!,
              to: invoice.client_email,
              subject,
              text: body,
              html: htmlBody,
            })

            // Log reminder with tracking_id
            await adminSupabase.from('reminders').insert({
              invoice_id: invoice.id,
              reminder_type: reminderType,
              status: 'sent',
              tracking_id: trackingId,
            })
            sent++
          } catch (emailError) {
            // Log failed reminder
            await adminSupabase.from('reminders').insert({
              invoice_id: invoice.id,
              reminder_type: reminderType,
              status: 'failed',
              error_message: String(emailError),
            })
            failed++
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Reminders processed',
      processed,
      sent,
      failed,
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error.message || 'Cron job failed' },
      { status: 500 }
    )
  }
}
