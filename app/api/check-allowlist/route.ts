import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Returns whether an email is on the beta allowlist (allowed to sign up).
 * Only returns true/false; does not leak the list.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ allowed: false })
    }

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from('beta_allowlist')
      .select('email')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      console.error('Allowlist check error:', error)
      return NextResponse.json({ allowed: false })
    }

    return NextResponse.json({ allowed: !!data })
  } catch {
    return NextResponse.json({ allowed: false })
  }
}
