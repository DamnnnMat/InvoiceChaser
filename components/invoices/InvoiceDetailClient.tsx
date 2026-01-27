'use client'

import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowLeft, CheckCircle2, XCircle, Calendar, DollarSign, Clock, FileText, Eye, Mail, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import PageHeader from '@/components/layout/PageHeader'
import ResendEmailDialog from './ResendEmailDialog'
import AddPaymentDialog from './AddPaymentDialog'
import ActivityTimeline, { TimelineEvent } from './ActivityTimeline'

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

interface Payment {
  id: string
  amount_cents: number
  paid_at: string
  note: string | null
}

export default function InvoiceDetailClient({
  invoice,
  reminders,
  payments,
  timelineEvents,
  totalPaid,
  outstanding,
  lastSeen,
  isOverdue,
}: {
  invoice: Invoice
  reminders: Reminder[]
  payments: Payment[]
  timelineEvents: TimelineEvent[]
  totalPaid: number
  outstanding: number
  lastSeen: string | null
  isOverdue: boolean
}) {
  const router = useRouter()

  const getStatus = () => {
    if (outstanding === 0) return 'paid'
    if (totalPaid > 0 && outstanding > 0) return 'partially_paid'
    if (isOverdue) return 'overdue'
    return 'upcoming'
  }

  const getStatusLabel = () => {
    const status = getStatus()
    switch (status) {
      case 'paid':
        return 'Paid'
      case 'partially_paid':
        return 'Partially Paid'
      case 'overdue':
        return 'Overdue'
      case 'upcoming':
        return 'Upcoming'
      default:
        return 'Unpaid'
    }
  }

  const handleMarkPaid = async () => {
    if (outstanding > 0) {
      // If there's outstanding amount, mark as paid (sets is_paid = true)
      try {
        await fetch(`/api/invoices/${invoice.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_paid: true }),
        })
        router.refresh()
      } catch (error) {
        console.error('Failed to update invoice', error)
      }
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
              <Badge 
                variant={getStatus() === 'paid' ? 'default' : getStatus() === 'overdue' ? 'destructive' : 'outline'} 
                className="text-sm"
              >
                {getStatusLabel()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600 font-medium">Total Amount</p>
                  <p className="text-lg font-semibold text-slate-900">£{invoice.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-slate-600 font-medium">Total Paid</p>
                  <p className="text-lg font-semibold text-slate-900">£{totalPaid.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <FileText className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600 font-medium">Outstanding</p>
                  <p className="text-lg font-semibold text-slate-900">£{outstanding.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600 font-medium">Due Date</p>
                  <p className="text-lg font-semibold text-slate-900">{format(new Date(invoice.due_date), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
              <Button
                onClick={handleMarkPaid}
                variant={outstanding === 0 ? 'outline' : 'default'}
                className="flex items-center gap-2"
                disabled={outstanding === 0}
              >
                {outstanding === 0 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Paid
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Paid
                  </>
                )}
              </Button>
              <AddPaymentDialog invoice={{ ...invoice, amount: invoice.amount }} />
              <ResendEmailDialog invoice={invoice} />
            </div>
          </CardContent>
        </Card>

        {/* Client Engagement Signals */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Client Engagement Signals</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Engagement is tracked via email open pixels. Opens may be undercounted if images are blocked.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription className="mt-1">
              How this client is responding to your reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metrics Grid - First box shows engagement status */}
            <div className="grid gap-4 md:grid-cols-3">
              {(() => {
                // Compute engagement status for first metric box
                // Status computation logic:
                // - If paid AND has opens: "Paid after opening"
                // - If paid AND no opens: "Paid"
                // - If unpaid AND has opens: "Opened · Unpaid" (or "Opened · Overdue" if overdue)
                // - If unpaid AND has reminders but no opens: "Not opened yet"
                // - If unpaid AND no reminders: "No reminders sent yet"
                const isPaid = outstanding <= 0
                const hasAnyReminders = reminders.length > 0
                const totalOpenCount = reminders.reduce((sum, r) => sum + (r.open_count || 0), 0)
                
                let statusLabel = ''
                let statusValue = ''
                let statusIcon = Eye
                let statusColor = 'blue'
                
                if (isPaid && lastSeen) {
                  statusLabel = 'Paid after opening'
                  statusValue = `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
                  statusIcon = CheckCircle2
                  statusColor = 'green'
                } else if (isPaid && !lastSeen) {
                  statusLabel = 'Paid'
                  statusValue = 'No tracked opens'
                  statusIcon = CheckCircle2
                  statusColor = 'green'
                } else if (outstanding > 0 && lastSeen) {
                  statusLabel = isOverdue ? 'Opened · Overdue' : 'Opened · Unpaid'
                  statusValue = `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
                  statusIcon = Eye
                  statusColor = isOverdue ? 'red' : 'blue'
                } else if (outstanding > 0 && hasAnyReminders && !lastSeen) {
                  statusLabel = 'Not opened yet'
                  statusValue = 'No tracked opens'
                  statusIcon = Clock
                  statusColor = 'slate'
                } else if (outstanding > 0 && !hasAnyReminders) {
                  statusLabel = 'No reminders sent yet'
                  statusValue = 'Send a reminder to start tracking'
                  statusIcon = Mail
                  statusColor = 'slate'
                }
                
                const StatusIcon = statusIcon
                const bgColorClass = {
                  blue: 'bg-blue-50',
                  green: 'bg-green-50',
                  red: 'bg-red-50',
                  slate: 'bg-slate-50',
                }[statusColor]
                const iconColorClass = {
                  blue: 'text-blue-600',
                  green: 'text-green-600',
                  red: 'text-red-600',
                  slate: 'text-slate-600',
                }[statusColor]
                
                return (
                  <div className={`flex items-start gap-3 p-4 ${bgColorClass} rounded-lg`}>
                    <StatusIcon className={`h-5 w-5 ${iconColorClass} mt-0.5`} />
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 font-medium mb-1">{statusLabel}</p>
                      <p className="text-sm font-semibold text-slate-900">{statusValue}</p>
                    </div>
                  </div>
                )
              })()}
              
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-slate-600 font-medium mb-1">Reminder views</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {reminders.reduce((sum, r) => sum + (r.open_count || 0), 0)}
                  </p>
                </div>
              </div>
              
              {(() => {
                // Calculate typical open time (time from sent_at to opened_at for opened reminders)
                const openedReminders = reminders.filter(r => r.opened_at && r.sent_at)
                if (openedReminders.length === 0) {
                  return (
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-600 font-medium mb-1">Typical open time</p>
                        <p className="text-sm font-semibold text-slate-900">—</p>
                      </div>
                    </div>
                  )
                }
                
                const totalResponseTime = openedReminders.reduce((sum, r) => {
                  const sentAt = new Date(r.sent_at).getTime()
                  const openedAt = new Date(r.opened_at!).getTime()
                  return sum + (openedAt - sentAt)
                }, 0)
                const avgResponseTimeMs = totalResponseTime / openedReminders.length
                const avgResponseTimeHours = Math.round(avgResponseTimeMs / (1000 * 60 * 60))
                
                // Only show if we have meaningful data (at least 1 hour)
                if (avgResponseTimeHours < 1) {
                  return (
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-600 font-medium mb-1">Typical open time</p>
                        <p className="text-sm font-semibold text-slate-900">—</p>
                      </div>
                    </div>
                  )
                }
                
                return (
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 font-medium mb-1">Typical open time</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {avgResponseTimeHours < 24 
                          ? `${avgResponseTimeHours} hours`
                          : `${Math.round(avgResponseTimeHours / 24)} days`}
                      </p>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Interpretation Sentence */}
            {(() => {
              const isPaid = outstanding <= 0
              const totalOpenCount = reminders.reduce((sum, r) => sum + (r.open_count || 0), 0)
              
              if (isPaid && lastSeen) {
                return (
                  <p className="text-sm text-slate-600">
                    Client paid after viewing your reminder.
                  </p>
                )
              } else if (outstanding > 0 && totalOpenCount >= 2) {
                return (
                  <p className="text-sm text-slate-600">
                    Client has opened reminders multiple times without paying.
                  </p>
                )
              } else if (outstanding > 0 && lastSeen && totalOpenCount < 2) {
                return (
                  <p className="text-sm text-slate-600">
                    Client has seen your reminder — consider following up.
                  </p>
                )
              } else if (outstanding > 0 && !lastSeen) {
                return (
                  <p className="text-sm text-slate-600">
                    No engagement detected yet — some email clients block images.
                  </p>
                )
              }
              return null
            })()}

            <p className="text-xs text-slate-500">
              This updates automatically when reminder emails are opened.
            </p>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <ActivityTimeline
          events={timelineEvents}
          outstanding={outstanding}
          lastSeen={lastSeen}
          isOverdue={isOverdue}
          invoiceId={invoice.id}
        />
      </div>
    </>
  )
}
