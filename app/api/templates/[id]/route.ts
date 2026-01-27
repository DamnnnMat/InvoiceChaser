import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { name, tone, subject, body: emailBody, saveAsNewVersion, versionName } = body

    const adminSupabase = createAdminClient()

    // Verify template belongs to user
    const { data: template, error: templateError } = await adminSupabase
      .from('templates')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .eq('is_system', false)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Update template metadata
    if (name || tone) {
      await adminSupabase
        .from('templates')
        .update({
          ...(name && { name }),
          ...(tone && { tone }),
        })
        .eq('id', params.id)
    }

    // Handle version creation/update
    if (subject && emailBody) {
      if (saveAsNewVersion) {
        // Deactivate current active version
        await adminSupabase
          .from('template_versions')
          .update({ is_active: false })
          .eq('template_id', params.id)
          .eq('is_active', true)

        // Create new active version
        const { data: newVersion, error: versionError } = await adminSupabase
          .from('template_versions')
          .insert({
            template_id: params.id,
            name: versionName || `Version ${new Date().toISOString().split('T')[0]}`,
            subject,
            body: emailBody,
            is_active: true,
          })
          .select()
          .single()

        if (versionError || !newVersion) {
          throw versionError
        }

        return NextResponse.json({ template, version: newVersion })
      } else {
        // Update active version
        const { data: updatedVersion, error: versionError } = await adminSupabase
          .from('template_versions')
          .update({
            subject,
            body: emailBody,
            updated_at: new Date().toISOString(),
          })
          .eq('template_id', params.id)
          .eq('is_active', true)
          .select()
          .single()

        if (versionError || !updatedVersion) {
          throw versionError
        }

        return NextResponse.json({ template, version: updatedVersion })
      }
    }

    return NextResponse.json({ template })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Delete template (cascade will delete versions)
    const { error } = await adminSupabase
      .from('templates')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    )
  }
}
