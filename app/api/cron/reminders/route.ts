import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { getTemplateForReminder } from '@/lib/templates'

// Initialize Resend lazily to avoid build-time errors
function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

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

      let reminderType: 'before_due' | 'on_due' | 'after_due' | null = null
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

        // Get template using new system
        const emailTemplate = await getTemplateForReminder(adminSupabase, invoice.user_id, reminderType)
        
        // Get payments for outstanding amount calculation
        const { data: payments } = await adminSupabase
          .from('invoice_payments')
          .select('*')
          .eq('invoice_id', invoice.id)
        
        const totalPaid = payments?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
        const invoiceAmountCents = Math.round(invoice.amount * 100)
        const outstandingCents = invoiceAmountCents - totalPaid
        const outstanding = (outstandingCents / 100).toFixed(2)
        const paidAmount = (totalPaid / 100).toFixed(2)

        // Replace all variables
        const replacements: { [key: string]: string } = {
          '{client_name}': invoice.client_name,
          '{client_email}': invoice.client_email,
          '{invoice_number}': invoice.id.substring(0, 8).toUpperCase(),
          '{amount}': invoice.amount.toFixed(2),
          '{due_date}': dueDate.toLocaleDateString(),
          '{outstanding_amount}': outstanding,
          '{paid_amount}': paidAmount,
          '{final_date}': new Date(dueDate.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          '{sender_name}': 'Team',
        }

        let subject = emailTemplate.subject
        let body = emailTemplate.body

        Object.entries(replacements).forEach(([key, value]) => {
          subject = subject.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
          body = body.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
        })

        try {
          // Generate tracking_id before sending
          const trackingId = crypto.randomUUID()
          const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/track/open?rid=${trackingId}" width="1" height="1" style="display:none;" alt="" />`
          
          // Convert text body to HTML and append tracking pixel
          const htmlBody = body.replace(/\n/g, '<br/>') + trackingPixel

          const resend = getResend()
          const emailResult = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: invoice.client_email,
            subject,
            text: body,
            html: htmlBody,
          })

          // Check for Resend API errors
          if (emailResult.error) {
            throw new Error(`Resend API error: ${emailResult.error.message || JSON.stringify(emailResult.error)}`)
          }

          if (!emailResult.data || !emailResult.data.id) {
            throw new Error(`Resend API returned success but no email ID. Response: ${JSON.stringify(emailResult)}`)
          }

          // Log reminder with tracking_id and metadata (automated)
          await adminSupabase.from('reminders').insert({
            invoice_id: invoice.id,
            reminder_type: reminderType,
            status: 'sent',
            tracking_id: trackingId,
            is_manual: false, // Automated
            template_id: emailTemplate.template_id || null,
            template_type: emailTemplate.template_type,
          })
          sent++
        } catch (emailError) {
          // Log failed reminder with metadata (automated)
          await adminSupabase.from('reminders').insert({
            invoice_id: invoice.id,
            reminder_type: reminderType,
            status: 'failed',
            error_message: String(emailError),
            is_manual: false, // Automated
            template_id: emailTemplate.template_id || null,
            template_type: emailTemplate.template_type,
          })
          failed++
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
