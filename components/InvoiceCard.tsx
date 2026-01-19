'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import StatusBadge from './StatusBadge'
import './InvoiceCard.css'

interface Invoice {
  id: string
  client_name: string
  client_email: string
  amount: number
  due_date: string
  is_paid: boolean
  created_at: string
}

export default function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const router = useRouter()

  const getStatus = () => {
    if (invoice.is_paid) return 'paid'
    const dueDate = new Date(invoice.due_date)
    const now = new Date()
    if (dueDate < now) return 'overdue'
    return 'upcoming'
  }

  const handleMarkPaid = async () => {
    try {
      await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_paid: !invoice.is_paid }),
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to update invoice', error)
    }
  }

  return (
    <div className="invoice-card">
      <div className="invoice-header">
        <div>
          <h3>{invoice.client_name}</h3>
          <p className="invoice-email">{invoice.client_email}</p>
        </div>
        <StatusBadge status={getStatus()} />
      </div>
      <div className="invoice-details">
        <div className="detail-item">
          <span className="label">Amount:</span>
          <span className="value">£{invoice.amount.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Due Date:</span>
          <span className="value">{format(new Date(invoice.due_date), 'MMM d, yyyy')}</span>
        </div>
      </div>
      <div className="invoice-actions">
        <button
          onClick={() => router.push(`/app/invoices/${invoice.id}`)}
          className="btn-secondary"
        >
          View Invoice
        </button>
        <button
          onClick={handleMarkPaid}
          className={invoice.is_paid ? 'btn-secondary' : 'btn-success'}
        >
          {invoice.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
        </button>
      </div>
    </div>
  )
}
