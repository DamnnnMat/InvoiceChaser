import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import TemplateVersionsClient from '@/components/templates/TemplateVersionsClient'

export default async function TemplateVersionsPage({
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
  const { data: template } = await adminSupabase
    .from('templates')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .eq('is_system', false)
    .single()

  if (!template) {
    redirect('/app/templates')
  }

  // Get all versions
  const { data: versions } = await adminSupabase
    .from('template_versions')
    .select('*')
    .eq('template_id', params.id)
    .order('created_at', { ascending: false })

  return <TemplateVersionsClient template={template} versions={versions || []} />
}
