import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignupForm from '@/components/SignupForm'

export default async function SignupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/app/billing')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>InvoiceSeen</h1>
        <h2>Sign Up</h2>
        <SignupForm />
      </div>
    </div>
  )
}
