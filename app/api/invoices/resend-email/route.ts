import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

// Initialize Resend lazily to avoid build-time errors
function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invoice_id, reminder_type } = body

    const adminSupabase = createAdminClient()

    // Get invoice
    const { data: invoice, error: invoiceError } = await adminSupabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .eq('user_id', user.id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.is_paid) {
      return NextResponse.json({ error: 'Cannot send reminders for paid invoices' }, { status: 400 })
    }

    // Get template
    const templateType = reminder_type === 'before_due' ? 'friendly' : 
                        reminder_type === 'on_due' ? 'firm' : 'final'

    const { data: template } = await adminSupabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('template_type', templateType)
      .single()

    // Use default if no template
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

    const emailTemplate = template || defaults[templateType]
    const dueDate = new Date(invoice.due_date)

    const subject = emailTemplate.subject
      .replace('{client_name}', invoice.client_name)
      .replace('{amount}', invoice.amount.toString())
      .replace('{due_date}', dueDate.toLocaleDateString())

    const emailBody = emailTemplate.body
      .replace('{client_name}', invoice.client_name)
      .replace('{amount}', invoice.amount.toString())
      .replace('{due_date}', dueDate.toLocaleDateString())

    // Generate tracking_id before sending
    const trackingId = crypto.randomUUID()
    const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/track/open?rid=${trackingId}" width="1" height="1" style="display:none;" alt="" />`
    
    // Convert text body to HTML and append tracking pixel
    const htmlBody = `<p>${emailBody.replace(/\n/g, '<br/>')}</p>${trackingPixel}`

    // Send email
    try {
      const resend = getResend()
      const emailResult = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: invoice.client_email,
        subject,
        text: emailBody,
        html: htmlBody,
      })

      // Log reminder with tracking_id
      await adminSupabase.from('reminders').insert({
        invoice_id: invoice.id,
        reminder_type,
        status: 'sent',
        tracking_id: trackingId,
      })

      console.log('Email sent successfully:', {
        to: invoice.client_email,
        trackingId,
        resendId: emailResult.data?.id,
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully',
        trackingId, // Include for debugging
      })
    } catch (emailError: any) {
      console.error('Email send error:', emailError)
      
      // Log failed reminder
      await adminSupabase.from('reminders').insert({
        invoice_id: invoice.id,
        reminder_type,
        status: 'failed',
        error_message: emailError.message || String(emailError),
      })

      return NextResponse.json(
        { 
          error: emailError.message || 'Failed to send email',
          details: emailError.toString(),
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to resend email' },
      { status: 500 }
    )
  }
}
