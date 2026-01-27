import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TemplateEditorClient from '@/components/templates/TemplateEditorClient'

export default async function NewTemplatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <TemplateEditorClient mode="new" />
}
