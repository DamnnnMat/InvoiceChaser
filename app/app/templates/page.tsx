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
  
  // Get templates
  const { data: templates } = await adminSupabase
    .from('email_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('template_type')

  // If no templates, create defaults
  if (!templates || templates.length === 0) {
    await adminSupabase.rpc('create_default_templates', { user_uuid: user.id })
    const { data: newTemplates } = await adminSupabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('template_type')
    
    return <TemplatesClient templates={newTemplates || []} />
  }

  return <TemplatesClient templates={templates} />
}
