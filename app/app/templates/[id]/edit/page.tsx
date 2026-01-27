import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import TemplateEditorClient from '@/components/templates/TemplateEditorClient'

export default async function EditTemplatePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminSupabase = createAdminClient()

  // Get template
  const { data: template, error: templateError } = await adminSupabase
    .from('templates')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .eq('is_system', false)
    .single()

  if (templateError || !template) {
    console.error('Error fetching template:', templateError)
    redirect('/app/templates')
  }

  // Get active version
  const { data: activeVersion, error: versionError } = await adminSupabase
    .from('template_versions')
    .select('*')
    .eq('template_id', params.id)
    .eq('is_active', true)
    .single()

  if (versionError || !activeVersion) {
    console.error('Error fetching template version:', versionError)
    redirect('/app/templates')
  }

  // Combine template with active version
  const templateWithVersion = {
    ...template,
    active_version: activeVersion,
  }

  return <TemplateEditorClient mode="edit" template={templateWithVersion} />
}
