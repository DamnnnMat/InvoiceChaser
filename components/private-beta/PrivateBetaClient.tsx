'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PrivateBetaClient() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <p className="text-sm text-slate-500">
      <button
        type="button"
        onClick={handleSignOut}
        className="underline hover:text-slate-700"
      >
        Sign out
      </button>
      {' or '}
      <Link href="/login" className="underline hover:text-slate-700">
        log in with a different account
      </Link>
      .
    </p>
  )
}
