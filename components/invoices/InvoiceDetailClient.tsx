'use client'

import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowLeft, CheckCircle2, XCircle, Mail, Calendar, DollarSign, Clock, FileText, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PageHeader from '@/components/layout/PageHeader'
import ResendEmailDialog from './ResendEmailDialog'

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
  opened_at: string | null
  open_count: number
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
    <>
      <PageHeader
        title="Invoice Details"
        description="View invoice information and reminder history"
        action={
          <Button variant="outline" onClick={() => router.push('/app/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Invoice Summary */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{invoice.client_name}</CardTitle>
                <CardDescription className="mt-1">{invoice.client_email}</CardDescription>
              </div>
              <Badge variant={getStatus()} className="text-sm">
                {getStatus().charAt(0).toUpperCase() + getStatus().slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600 font-medium">Amount</p>
                  <p className="text-lg font-semibold text-slate-900">£{invoice.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600 font-medium">Due Date</p>
                  <p className="text-lg font-semibold text-slate-900">{format(new Date(invoice.due_date), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Clock className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600 font-medium">Schedule</p>
                  <p className="text-sm font-medium text-slate-900">
                    {invoice.reminder_schedule === 'default' ? 'Default' : 'Custom'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
              <Button
                onClick={handleMarkPaid}
                variant={invoice.is_paid ? 'outline' : 'default'}
                className="flex items-center gap-2"
              >
                {invoice.is_paid ? (
                  <>
                    <XCircle className="h-4 w-4" />
                    Mark Unpaid
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Paid
                  </>
                )}
              </Button>
              <ResendEmailDialog invoice={invoice} />
            </div>
          </CardContent>
        </Card>

        {/* Reminder History */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-600" />
              <CardTitle>Reminder History</CardTitle>
            </div>
            <CardDescription>
              Track all reminder emails sent for this invoice
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">No reminders sent yet.</p>
                <p className="text-sm text-slate-500">Reminders will appear here once they're sent.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Open Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.map((reminder) => {
                    const isOpened = reminder.opened_at !== null
                    const openCount = reminder.open_count || 0
                    return (
                      <TableRow key={reminder.id}>
                        <TableCell className="font-medium">
                          {getReminderTypeLabel(reminder.reminder_type)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {format(new Date(reminder.sent_at), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          {reminder.status === 'sent' ? (
                            <div className="flex items-center gap-2">
                              {isOpened ? (
                                <>
                                  <Eye className="h-4 w-4 text-green-600" />
                                  <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                                    Opened
                                  </Badge>
                                  <span className="text-xs text-slate-500">
                                    {reminder.opened_at && (
                                      <>
                                        {formatDistanceToNow(new Date(reminder.opened_at), { addSuffix: true })}
                                        {openCount > 1 && ` • ${openCount} times`}
                                      </>
                                    )}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-4 w-4 text-slate-400" />
                                  <Badge variant="outline" className="text-slate-600">
                                    Not opened
                                  </Badge>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={reminder.status === 'sent' ? 'default' : 'destructive'}>
                            {reminder.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {reminder.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
