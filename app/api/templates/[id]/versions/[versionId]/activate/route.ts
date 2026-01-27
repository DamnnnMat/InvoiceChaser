import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // Verify template belongs to user
    const { data: template } = await adminSupabase
      .from('templates')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .eq('is_system', false)
      .single()

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Verify version belongs to template
    const { data: version } = await adminSupabase
      .from('template_versions')
      .select('*')
      .eq('id', params.versionId)
      .eq('template_id', params.id)
      .single()

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Deactivate all versions for this template
    await adminSupabase
      .from('template_versions')
      .update({ is_active: false })
      .eq('template_id', params.id)

    // Activate the selected version
    const { data: activatedVersion, error: activateError } = await adminSupabase
      .from('template_versions')
      .update({ is_active: true })
      .eq('id', params.versionId)
      .select()
      .single()

    if (activateError || !activatedVersion) {
      throw activateError
    }

    return NextResponse.json({ version: activatedVersion })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to activate version' },
      { status: 500 }
    )
  }
}
