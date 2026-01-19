'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import StatusBadge from './StatusBadge'
import './InvoiceDetail.css'

interface Invoice {
  id: string
  client_name: string
  client_email: string
  amount: number
  due_date: string
  is_paid: boolean
  reminder_schedule: string
  created_at: string
}

interface Reminder {
  id: string
  reminder_type: string
  sent_at: string
  status: string
  error_message: string | null
}

export default function InvoiceDetailClient({
  invoice,
  reminders,
}: {
  invoice: Invoice
  reminders: Reminder[]
}) {
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

  const getReminderTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      before_due: 'Before Due Date',
      on_due: 'On Due Date',
      after_due: 'After Due Date',
    }
    return labels[type] || type
  }

  return (
    <div className="invoice-detail">
      <div className="page-header">
        <h1>Invoice Details</h1>
        <button onClick={() => router.push('/app/invoices')} className="btn-secondary">
          Back to Invoices
        </button>
      </div>

      <div className="card">
        <div className="invoice-summary">
          <div className="summary-header">
            <div>
              <h2>{invoice.client_name}</h2>
              <p className="invoice-email">{invoice.client_email}</p>
            </div>
            <StatusBadge status={getStatus()} />
          </div>

          <div className="summary-details">
            <div className="detail-item">
              <span className="label">Amount</span>
              <span className="value">£{invoice.amount.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Due Date</span>
              <span className="value">{format(new Date(invoice.due_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="detail-item">
              <span className="label">Reminder Schedule</span>
              <span className="value">
                {invoice.reminder_schedule === 'default'
                  ? 'Default (3 days before, on due date, then weekly)'
                  : invoice.reminder_schedule}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Created</span>
              <span className="value">{format(new Date(invoice.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>

          <div className="summary-actions">
            <button
              onClick={handleMarkPaid}
              className={invoice.is_paid ? 'btn-secondary' : 'btn-success'}
            >
              {invoice.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Reminder History</h2>
        {reminders.length === 0 ? (
          <div className="empty-reminders">
            <p>No reminders sent yet.</p>
          </div>
        ) : (
          <div className="reminders-list">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="reminder-item">
                <div className="reminder-info">
                  <div className="reminder-type">{getReminderTypeLabel(reminder.reminder_type)}</div>
                  <div className="reminder-date">
                    {format(new Date(reminder.sent_at), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
                <div className={`reminder-status ${reminder.status}`}>
                  {reminder.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                </div>
                {reminder.error_message && (
                  <div className="reminder-error">{reminder.error_message}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
