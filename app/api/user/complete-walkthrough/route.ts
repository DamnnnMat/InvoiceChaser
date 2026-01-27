import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // Update user's walkthrough flag
    const { error } = await adminSupabase
      .from('profiles')
      .update({ has_seen_walkthrough: true })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating walkthrough flag:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in POST /api/user/complete-walkthrough:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to complete walkthrough' },
      { status: 500 }
    )
  }
}
