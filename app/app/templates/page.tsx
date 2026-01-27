import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import TemplatesClient from '@/components/templates/TemplatesClient'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminSupabase = createAdminClient()
  
  // Get system templates
  const { data: systemTemplatesData, error: systemError } = await adminSupabase
    .from('templates')
    .select('*')
    .eq('is_system', true)
    .order('created_at')

  if (systemError) {
    console.error('Error fetching system templates:', systemError)
  }

  // Get user templates (including workflow config)
  const { data: userTemplatesData, error: userError } = await adminSupabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_system', false)
    .order('created_at', { ascending: false })

  if (userError) {
    console.error('Error fetching user templates:', userError)
  }

  // Get active versions for all templates
  const allTemplateIds = [
    ...(systemTemplatesData || []).map(t => t.id),
    ...(userTemplatesData || []).map(t => t.id),
  ]

  let activeVersions: { [key: string]: any } = {}
  if (allTemplateIds.length > 0) {
    const { data: versions } = await adminSupabase
      .from('template_versions')
      .select('*')
      .in('template_id', allTemplateIds)
      .eq('is_active', true)

    if (versions) {
      versions.forEach(v => {
        activeVersions[v.template_id] = v
      })
    }
  }

  // Attach active versions to templates
  const systemTemplates = (systemTemplatesData || []).map(t => ({
    ...t,
    active_version: activeVersions[t.id] || null,
  })).filter(t => t.active_version) // Only show templates with active versions

  const userTemplates = (userTemplatesData || []).map(t => ({
    ...t,
    active_version: activeVersions[t.id] || null,
  })).filter(t => t.active_version) // Only show templates with active versions

  // Debug logging
  console.log('Templates page data:', {
    systemTemplatesCount: systemTemplatesData?.length || 0,
    userTemplatesCount: userTemplatesData?.length || 0,
    activeVersionsCount: Object.keys(activeVersions).length,
    systemTemplatesWithVersions: systemTemplates.length,
    userTemplatesWithVersions: userTemplates.length,
  })

  if ((systemTemplatesData || []).length === 0) {
    console.warn('No system templates found. Please run migrations 005 and 006 in Supabase.')
  }

  return (
    <TemplatesClient
      systemTemplates={systemTemplates}
      userTemplates={userTemplates}
    />
  )
}
