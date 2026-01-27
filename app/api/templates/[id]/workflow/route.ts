import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templateId = params.id
    const { reminder_type } = await request.json()

    const adminSupabase = createAdminClient()

    // Verify template belongs to user and is not a system template
    const { data: existingTemplate, error: fetchError } = await adminSupabase
      .from('templates')
      .select('id, user_id, is_system')
      .eq('id', templateId)
      .single()

    if (fetchError || !existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    if (existingTemplate.user_id !== user.id || existingTemplate.is_system) {
      return NextResponse.json({ error: 'Unauthorized to modify this template' }, { status: 403 })
    }

    // If setting a reminder_type, clear it from any other template that has it
    if (reminder_type) {
      await adminSupabase
        .from('templates')
        .update({ reminder_type: null })
        .eq('user_id', user.id)
        .eq('reminder_type', reminder_type)
        .neq('id', templateId)
    }

    // Update the template
    const { data: updatedTemplate, error: updateError } = await adminSupabase
      .from('templates')
      .update({ reminder_type: reminder_type || null })
      .eq('id', templateId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating template workflow:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updatedTemplate)
  } catch (error: any) {
    console.error('Error in PATCH /api/templates/[id]/workflow:', error)
    return NextResponse.json({ error: error.message || 'Failed to update workflow' }, { status: 500 })
  }
}
