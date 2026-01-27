import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, date, note } = body

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Verify invoice belongs to user
    const { data: invoice, error: invoiceError } = await adminSupabase
      .from('invoices')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Convert amount to cents
    const amountCents = Math.round(amount * 100)

    // Create payment
    const { data: payment, error: paymentError } = await adminSupabase
      .from('invoice_payments')
      .insert({
        invoice_id: invoice.id,
        amount_cents: amountCents,
        paid_at: date,
        note: note || null,
      })
      .select()
      .single()

    if (paymentError) {
      throw paymentError
    }

    return NextResponse.json(payment)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add payment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Verify payment belongs to user's invoice
    const { data: payment } = await adminSupabase
      .from('invoice_payments')
      .select(`
        *,
        invoice:invoices!inner(user_id)
      `)
      .eq('id', paymentId)
      .single()

    if (!payment || (payment.invoice as any).user_id !== user.id) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Delete payment
    const { error } = await adminSupabase
      .from('invoice_payments')
      .delete()
      .eq('id', paymentId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete payment' },
      { status: 500 }
    )
  }
}
