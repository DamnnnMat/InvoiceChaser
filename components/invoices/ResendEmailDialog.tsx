'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Invoice {
  id: string
  client_name: string
  client_email: string
  amount: number
  due_date: string
  is_paid: boolean
}

export default function ResendEmailDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false)
  const [reminderType, setReminderType] = useState<'before_due' | 'on_due' | 'after_due'>('before_due')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleResend = async () => {
    if (invoice.is_paid) {
      setMessage('Cannot send reminders for paid invoices')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/invoices/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: invoice.id,
          reminder_type: reminderType,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      setMessage(`Email sent successfully to ${invoice.client_email}! Check your inbox (and spam folder).`)
      setTimeout(() => {
        setOpen(false)
        router.refresh()
      }, 1500)
    } catch (error: any) {
      setMessage(error.message || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        Resend Email
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend Email Reminder</DialogTitle>
            <DialogDescription>
              Manually send a reminder email for this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reminder Type</Label>
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="before_due">Friendly Reminder (Before Due)</option>
                <option value="on_due">Firm Reminder (On Due Date)</option>
                <option value="after_due">Final Notice (After Due Date)</option>
              </select>
            </div>
            {message && (
              <div className={`text-sm p-3 rounded-md ${
                message.includes('success') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResend} disabled={loading || invoice.is_paid}>
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
