import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ROLES = ['Freelancer', 'Agency', 'Accountant', 'Charity', 'Other'] as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const role = typeof body.role === 'string' && ROLES.includes(body.role as any) ? body.role : null
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 1000) : null
    const companyWebsite = body.company_website

    // Honeypot: reject if filled (bot)
    if (companyWebsite) {
      return NextResponse.json({ message: 'Thanks — you\'re on the list. We\'ll email you an invite when spots open.' })
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('beta_waitlist')
      .upsert({ email, role, notes }, { onConflict: 'email' })

    if (error) {
      console.error('Waitlist insert error:', error)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Thanks — you\'re on the list. We\'ll email you an invite when spots open.' })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
