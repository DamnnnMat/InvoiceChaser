import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

// Initialize Resend lazily to avoid build-time errors
function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured - feedback emails will not be sent')
    return null
  }
  return new Resend(apiKey)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { feedback, category } = await request.json()

    if (!feedback || !feedback.trim()) {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Get user profile for email
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    // Store feedback in database
    const { data: feedbackData, error } = await adminSupabase
      .from('feedback')
      .insert({
        user_id: user.id,
        feedback: feedback.trim(),
        category: category || 'other',
      })
      .select()
      .single()

    if (error) {
      console.error('Error storing feedback:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to store feedback',
        message: 'Feedback received but not stored (check logs)' 
      }, { status: 500 })
    }

    // Send email notification to support
    let emailStatus = 'not_sent'
    let emailError = null
    
    try {
      const resend = getResend()
      const emailFrom = process.env.EMAIL_FROM
      
      console.log('Feedback email check:', {
        hasResend: !!resend,
        hasEmailFrom: !!emailFrom,
        emailFrom: emailFrom,
      })
      
      if (!resend) {
        console.warn('RESEND_API_KEY is not configured - feedback email not sent')
        emailStatus = 'resend_not_configured'
      } else if (!emailFrom) {
        console.warn('EMAIL_FROM is not configured - feedback email not sent')
        emailStatus = 'email_from_not_configured'
      } else {
        const categoryLabels: { [key: string]: string } = {
          bug: 'Bug Report',
          feature: 'Feature Request',
          improvement: 'Improvement Suggestion',
          other: 'Other Feedback',
        }

        console.log('Attempting to send feedback email to support@invoiceseen.com')
        
        const emailResult = await resend.emails.send({
          from: emailFrom,
          to: 'support@invoiceseen.com',
          subject: `New Feedback: ${categoryLabels[category || 'other']}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">New Feedback Submission</h2>
              
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 8px 0;"><strong>Category:</strong> ${categoryLabels[category || 'other']}</p>
                <p style="margin: 8px 0;"><strong>From:</strong> ${profile?.email || user.id}</p>
                <p style="margin: 8px 0;"><strong>User ID:</strong> ${user.id}</p>
                <p style="margin: 8px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div style="background: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 16px 0;">
                <h3 style="color: #374151; margin-top: 0;">Feedback:</h3>
                <p style="color: #4b5563; white-space: pre-wrap; line-height: 1.6;">${feedback.trim().replace(/\n/g, '<br>')}</p>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                This feedback has been stored in the database. You can view it in the Supabase dashboard.
              </p>
            </div>
          `,
        })

        if (emailResult.error) {
          console.error('Resend API error sending feedback email:', JSON.stringify(emailResult.error, null, 2))
          emailStatus = 'failed'
          emailError = emailResult.error.message || JSON.stringify(emailResult.error)
        } else if (emailResult.data?.id) {
          console.log('Feedback email sent successfully. Email ID:', emailResult.data.id)
          emailStatus = 'sent'
        } else {
          console.warn('Resend returned success but no email ID. Response:', JSON.stringify(emailResult))
          emailStatus = 'unknown'
        }
      }
    } catch (emailError: any) {
      console.error('Exception sending feedback email:', emailError)
      emailStatus = 'exception'
      emailError = emailError.message || String(emailError)
    }

    return NextResponse.json({ 
      success: true, 
      feedback: feedbackData,
      email_status: emailStatus,
      email_error: emailError,
    })
  } catch (error: any) {
    console.error('Error in feedback API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
