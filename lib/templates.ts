import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Get template for reminder sending
 * Priority: User custom template > System template > Default fallback
 */
export async function getTemplateForReminder(
  adminSupabase: SupabaseClient,
  userId: string,
  reminderType: 'before_due' | 'on_due' | 'after_due' | 'partial_payment'
) {
  // First, try to get user's template configured for this reminder type (workflow config)
  const { data: workflowTemplate } = await adminSupabase
    .from('templates')
    .select('*')
    .eq('user_id', userId)
    .eq('is_system', false)
    .eq('reminder_type', reminderType)
    .single()

  if (workflowTemplate) {
    // Get active version
    const { data: activeVersion } = await adminSupabase
      .from('template_versions')
      .select('*')
      .eq('template_id', workflowTemplate.id)
      .eq('is_active', true)
      .single()

    if (activeVersion) {
      return {
        subject: activeVersion.subject,
        body: activeVersion.body,
        template_id: workflowTemplate.id,
        template_type: workflowTemplate.tone,
        template_name: workflowTemplate.name,
      }
    }
  }

  // Fallback: Map reminder type to tone (legacy behavior)
  const toneMap: { [key: string]: string } = {
    before_due: 'friendly',
    on_due: 'neutral',
    after_due: 'firm',
    partial_payment: 'partial',
  }
  const tone = toneMap[reminderType] || 'friendly'

  // Try to get user's custom template by tone (if no workflow config)
  const { data: userTemplate } = await adminSupabase
    .from('templates')
    .select('*')
    .eq('user_id', userId)
    .eq('is_system', false)
    .eq('tone', tone)
    .is('reminder_type', null) // Only get templates not configured for workflow
    .single()

  if (userTemplate) {
    // Get active version
    const { data: activeVersion } = await adminSupabase
      .from('template_versions')
      .select('*')
      .eq('template_id', userTemplate.id)
      .eq('is_active', true)
      .single()

    if (activeVersion) {
      return {
        subject: activeVersion.subject,
        body: activeVersion.body,
        template_id: userTemplate.id,
        template_type: tone,
      }
    }
  }

  // Fall back to system template
  const slugMap: { [key: string]: string } = {
    before_due: 'friendly-pre-due',
    on_due: 'due-today',
    after_due: 'firm-follow-up',
  }
  const slug = slugMap[reminderType]

  const { data: systemTemplate } = await adminSupabase
    .from('templates')
    .select('*')
    .eq('is_system', true)
    .eq('slug', slug)
    .single()

  if (systemTemplate) {
    // Get active version
    const { data: activeVersion } = await adminSupabase
      .from('template_versions')
      .select('*')
      .eq('template_id', systemTemplate.id)
      .eq('is_active', true)
      .single()

    if (activeVersion) {
      return {
        subject: activeVersion.subject,
        body: activeVersion.body,
        template_id: systemTemplate.id,
        template_type: tone,
      }
    }
  }

  // Final fallback to hardcoded defaults
  const defaults: { [key: string]: { subject: string; body: string } } = {
    friendly: {
      subject: 'Friendly Reminder: Invoice Payment Due',
      body: 'Hi {client_name}, Just a friendly reminder that your invoice for £{amount} is due on {due_date}. Thank you!',
    },
    neutral: {
      subject: 'Invoice {invoice_number} due today',
      body: 'Hi {client_name}, This is a reminder that invoice {invoice_number} for £{amount} is due today ({due_date}). Please arrange payment at your earliest convenience.',
    },
    firm: {
      subject: 'Overdue invoice - action required',
      body: 'Hi {client_name}, Invoice {invoice_number} for £{amount} remains outstanding since {due_date}. Please confirm when payment will be made.',
    },
  }

  const defaultTemplate = defaults[tone] || defaults.friendly
  return {
    subject: defaultTemplate.subject,
    body: defaultTemplate.body,
    template_id: null,
    template_type: tone,
  }
}
