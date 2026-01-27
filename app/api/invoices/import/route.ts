import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface CSVRow {
  invoice_ref: string
  client_name: string
  client_email?: string
  amount: number
  due_date: string
  status?: string
  notes?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rows } = await request.json() as { rows: CSVRow[] }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Server-side validation and normalization
    const validatedRows: any[] = []
    const invalidRows: number[] = []

    rows.forEach((row, index) => {
      const errors: string[] = []

      // Validate required fields
      if (!row.invoice_ref || !row.invoice_ref.trim()) {
        errors.push('invoice_ref is required')
      }
      if (!row.client_name || !row.client_name.trim()) {
        errors.push('client_name is required')
      }
      if (!row.amount || typeof row.amount !== 'number' || row.amount <= 0) {
        errors.push('amount must be a positive number')
      }
      if (!row.due_date || !row.due_date.trim()) {
        errors.push('due_date is required')
      } else {
        const date = new Date(row.due_date)
        if (isNaN(date.getTime())) {
          errors.push('due_date must be a valid date')
        }
      }

      // Validate optional fields
      if (row.client_email && row.client_email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(row.client_email.trim())) {
          errors.push('client_email must be a valid email')
        }
      }

      if (row.status) {
        const validStatuses = ['unpaid', 'overdue', 'paid', 'partially_paid']
        if (!validStatuses.includes(row.status.toLowerCase())) {
          errors.push(`status must be one of: ${validStatuses.join(', ')}`)
        }
      }

      if (errors.length > 0) {
        invalidRows.push(index + 1)
        return
      }

      // Normalize and prepare for insert
      const dueDate = new Date(row.due_date)
      const status = row.status?.toLowerCase() || 'unpaid'
      const isPaid = status === 'paid'

      validatedRows.push({
        user_id: user.id,
        invoice_ref: row.invoice_ref.trim(),
        client_name: row.client_name.trim(),
        client_email: row.client_email?.trim() || null, // Allow null for missing emails
        amount: parseFloat(row.amount.toFixed(2)),
        due_date: dueDate.toISOString(),
        status: status,
        is_paid: isPaid,
        notes: row.notes?.trim() || null,
        reminder_schedule: 'default',
      })
    })

    if (validatedRows.length === 0) {
      return NextResponse.json({
        imported_count: 0,
        skipped_duplicates_count: 0,
        invalid_count: invalidRows.length,
      })
    }

    // Insert rows, skipping duplicates
    let importedCount = 0
    let skippedCount = 0

    // Insert in batches to handle conflicts gracefully
    for (const row of validatedRows) {
      const { error } = await adminSupabase
        .from('invoices')
        .insert(row)
        .select()
        .single()

      if (error) {
        // Check if it's a unique constraint violation (duplicate)
        if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
          skippedCount++
        } else {
          console.error('Error inserting invoice:', error)
          // Treat as invalid
          invalidRows.push(validatedRows.indexOf(row) + 1)
        }
      } else {
        importedCount++
      }
    }

    return NextResponse.json({
      imported_count: importedCount,
      skipped_duplicates_count: skippedCount,
      invalid_count: invalidRows.length,
    })
  } catch (error: any) {
    console.error('Error in POST /api/invoices/import:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import invoices' },
      { status: 500 }
    )
  }
}
