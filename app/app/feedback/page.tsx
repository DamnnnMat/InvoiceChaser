import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FeedbackFormClient from '@/components/feedback/FeedbackFormClient'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function FeedbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <PageHeader
        title="Share Your Feedback"
        description="Help us improve InvoiceSeen by sharing your thoughts, suggestions, or reporting issues."
        action={
          <Button variant="outline" asChild>
            <Link href="/app/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        }
      />
      <FeedbackFormClient />
    </>
  )
}
