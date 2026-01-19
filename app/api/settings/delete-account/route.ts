import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // Delete all user data (cascade will handle related records)
    const { error } = await adminSupabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (error) throw error

    // Delete auth user
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(user.id)
    if (authError) throw authError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    )
  }
}
