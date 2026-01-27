import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
    const { name, tone, subject, body: emailBody, versionName } = body

    if (!name || !tone || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Name, tone, subject, and body are required' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // Create template
    const { data: template, error: templateError } = await adminSupabase
      .from('templates')
      .insert({
        user_id: user.id,
        name,
        tone,
        is_system: false,
      })
      .select()
      .single()

    if (templateError || !template) {
      throw templateError
    }

    // Create initial active version
    const { data: version, error: versionError } = await adminSupabase
      .from('template_versions')
      .insert({
        template_id: template.id,
        name: versionName || 'Initial version',
        subject,
        body: emailBody,
        is_active: true,
      })
      .select()
      .single()

    if (versionError || !version) {
      throw versionError
    }

    return NextResponse.json({ template, version })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}
