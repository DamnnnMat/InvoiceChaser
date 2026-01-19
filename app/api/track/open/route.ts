import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 1x1 transparent PNG pixel
const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const trackingId = searchParams.get('rid')

  // Always return the pixel, even if tracking_id is invalid/missing
  // This prevents leaking information about whether a reminder exists
  const response = new NextResponse(TRANSPARENT_PIXEL, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Length': TRANSPARENT_PIXEL.length.toString(),
    },
  })

  // Validate tracking_id format (UUID)
  if (!trackingId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trackingId)) {
    return response
  }

  try {
    const adminSupabase = createAdminClient()

    // Lookup reminder by tracking_id
    const { data: reminder, error } = await adminSupabase
      .from('reminders')
      .select('id, opened_at, open_count')
      .eq('tracking_id', trackingId)
      .single()

    if (error || !reminder) {
      // Reminder not found, but still return pixel (don't leak data)
      return response
    }

    // Update opened_at and increment open_count atomically
    const updates: { open_count: number; opened_at?: string } = {
      open_count: (reminder.open_count || 0) + 1,
    }

    // Set opened_at only if it's null (first open)
    if (!reminder.opened_at) {
      updates.opened_at = new Date().toISOString()
    }

    // Update the reminder
    await adminSupabase
      .from('reminders')
      .update(updates)
      .eq('id', reminder.id)

    return response
  } catch (error) {
    // Log error but still return pixel
    console.error('Error tracking email open:', error)
    return response
  }
}
