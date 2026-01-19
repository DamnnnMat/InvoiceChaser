'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import InvoiceCard from './InvoiceCard'
import EmptyState from './EmptyState'
import './Invoices.css'

interface Invoice {
  id: string
  client_name: string
  client_email: string
  amount: number
  due_date: string
  is_paid: boolean
  created_at: string
}

export default function InvoicesClient({
  invoices,
  hasSubscription,
}: {
  invoices: Invoice[]
  hasSubscription: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  if (!hasSubscription) {
    return (
      <div className="invoices-page">
        <div className="error-message">
          Active subscription required. Please subscribe in{' '}
          <a href="/app/billing">Billing</a>.
        </div>
      </div>
    )
  }

  return (
    <div className="invoices-page">
      <div className="page-header">
        <h1>Invoices</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add Invoice'}
        </button>
      </div>

      {showForm && (
        <InvoiceForm
          onSuccess={() => {
            setShowForm(false)
            router.refresh()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          message="Create your first invoice to start sending automated reminders."
          actionLabel="Add Invoice"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="invoices-list">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  )
}

function InvoiceForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    amount: '',
    due_date: '',
    reminder_schedule: 'default',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          due_date: new Date(formData.due_date).toISOString(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create invoice')
      }

      onSuccess()
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Create Invoice</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Client Name</label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) =>
                setFormData({ ...formData, client_name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Client Email</label>
            <input
              type="email"
              value={formData.client_email}
              onChange={(e) =>
                setFormData({ ...formData, client_email: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Amount (£)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Reminder Schedule</label>
          <select
            value={formData.reminder_schedule}
            onChange={(e) =>
              setFormData({ ...formData, reminder_schedule: e.target.value })
            }
          >
            <option value="default">Default (3 days before, on due date, then weekly)</option>
            <option value="custom">Custom (coming soon)</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
