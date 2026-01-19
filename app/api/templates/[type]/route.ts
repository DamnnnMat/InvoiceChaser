import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const adminSupabase = createAdminClient()

    // Check if template exists
    const { data: existing } = await adminSupabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('template_type', params.type)
      .single()

    if (existing) {
      // Update
      const { data: template, error } = await adminSupabase
        .from('email_templates')
        .update({
          subject: body.subject,
          body: body.body,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('template_type', params.type)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(template)
    } else {
      // Create
      const { data: template, error } = await adminSupabase
        .from('email_templates')
        .insert({
          user_id: user.id,
          template_type: params.type,
          subject: body.subject,
          body: body.body,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(template)
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    )
  }
}
