import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/app/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Invoice Chaser</h1>
        <h2>Login</h2>
        <LoginForm />
      </div>
    </div>
  )
}
