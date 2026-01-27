import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { getTemplateForReminder } from '@/lib/templates'

// Initialize Resend lazily to avoid build-time errors
function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  if (apiKey === 're_placeholder' || apiKey.includes('placeholder')) {
    throw new Error('RESEND_API_KEY is still set to placeholder value')
  }
  console.log('Resend API Key check:', {
    hasKey: !!apiKey,
    keyPrefix: apiKey?.substring(0, 10),
    keyLength: apiKey?.length,
  })
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

    // Get template using new system
    const emailTemplate = await getTemplateForReminder(adminSupabase, user.id, reminder_type)
    const dueDate = new Date(invoice.due_date)
    
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
      '{sender_name}': user.email?.split('@')[0] || 'Team',
    }

    let subject = emailTemplate.subject
    let emailBody = emailTemplate.body

    Object.entries(replacements).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
      emailBody = emailBody.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
    })

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

      // Check for Resend API errors (Resend SDK doesn't throw, it returns errors in response)
      if (emailResult.error) {
        throw new Error(`Resend API error: ${emailResult.error.message || JSON.stringify(emailResult.error)}`)
      }

      // Check if Resend actually accepted the email
      if (!emailResult.data || !emailResult.data.id) {
        throw new Error(`Resend API returned success but no email ID. Response: ${JSON.stringify(emailResult)}`)
      }

      // Log reminder with tracking_id and metadata
      await adminSupabase.from('reminders').insert({
        invoice_id: invoice.id,
        reminder_type,
        status: 'sent',
        tracking_id: trackingId,
        is_manual: true, // Manual resend
        template_id: emailTemplate.template_id || null,
        template_type: emailTemplate.template_type,
      })

      console.log('Email sent successfully:', {
        to: invoice.client_email,
        from: process.env.EMAIL_FROM,
        trackingId,
        resendId: emailResult.data.id,
        resendResponse: JSON.stringify(emailResult, null, 2),
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully',
        trackingId, // Include for debugging
      })
    } catch (emailError: any) {
      console.error('Email send error:', {
        message: emailError.message,
        name: emailError.name,
        stack: emailError.stack,
        fullError: JSON.stringify(emailError, null, 2),
      })
      
      const errorMessage = emailError.message || emailError.toString() || 'Unknown error'
      
      // Log failed reminder with metadata
      await adminSupabase.from('reminders').insert({
        invoice_id: invoice.id,
        reminder_type,
        status: 'failed',
        error_message: errorMessage,
        is_manual: true, // Manual resend
        template_id: emailTemplate.template_id || null,
        template_type: emailTemplate.template_type,
      })

      return NextResponse.json(
        { 
          error: errorMessage,
          details: emailError.toString(),
          resendError: emailError.response?.data || emailError,
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
