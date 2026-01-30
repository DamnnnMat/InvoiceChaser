'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import './Auth.css'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setAccessDenied(false)
    setLoading(true)

    try {
      // Check allowlist before creating account
      const checkRes = await fetch('/api/check-allowlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const { allowed } = await checkRes.json()

      if (!allowed) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) throw error

      router.push('/app/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (accessDenied) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
          <p className="font-medium">Access required</p>
          <p className="mt-1">
            InvoiceSeen is currently in private beta. Request access to get an invite.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/">Request access</Link>
        </Button>
        <div className="auth-links">
          <Link href="/login">Already have an account? Login</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <div className="auth-links">
        <Link href="/login">Already have an account? Login</Link>
      </div>
    </>
  )
}
