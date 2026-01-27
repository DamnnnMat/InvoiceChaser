'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { Send, Eye, XCircle, FileText, CheckCircle2, Clock, Mail, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export type TimelineEvent = {
  id: string
  type: 'invoice_created' | 'reminder_sent' | 'reminder_opened' | 'reminder_failed' | 'payment_received' | 'marked_paid'
  title: string
  timestamp: string
  meta?: {
    amount_cents?: number
    email_type?: string
    to?: string
    open_count?: number
    note?: string
    reminder_type?: string
  }
  status?: 'success' | 'warning' | 'error' | 'info'
}

interface ActivityTimelineProps {
  events: TimelineEvent[]
  outstanding: number
  lastSeen: string | null
  isOverdue: boolean
  invoiceId: string
}

export default function ActivityTimeline({ events, outstanding, lastSeen, isOverdue, invoiceId }: ActivityTimelineProps) {
  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'invoice_created':
        return <FileText className="h-5 w-5 text-blue-600" />
      case 'reminder_sent':
        return <Send className="h-5 w-5 text-green-600" />
      case 'reminder_opened':
        return <Eye className="h-5 w-5 text-blue-600" />
      case 'reminder_failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'payment_received':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'marked_paid':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      default:
        return <Clock className="h-5 w-5 text-slate-600" />
    }
  }

  const getEventIconBg = (event: TimelineEvent) => {
    switch (event.type) {
      case 'invoice_created':
        return 'bg-blue-100'
      case 'reminder_sent':
        return 'bg-green-100'
      case 'reminder_opened':
        return 'bg-blue-100'
      case 'reminder_failed':
        return 'bg-red-100'
      case 'payment_received':
        return 'bg-green-100'
      case 'marked_paid':
        return 'bg-green-100'
      default:
        return 'bg-slate-100'
    }
  }

  const getEventTitle = (event: TimelineEvent) => {
    // Use provided title if available (allows server-side customization)
    if (event.title) return event.title
    
    // Fallback to default titles
    switch (event.type) {
      case 'invoice_created':
        return 'Invoice created'
      case 'reminder_sent':
        return 'Reminder sent'
      case 'reminder_opened':
        // Default fallback (should use title from server)
        return 'Reminder opened'
      case 'reminder_failed':
        return 'Failed to send'
      case 'payment_received':
        const amount = event.meta?.amount_cents ? (event.meta.amount_cents / 100).toFixed(2) : '0.00'
        return `Payment received: £${amount}`
      case 'marked_paid':
        return 'Marked paid'
      default:
        return 'Event'
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm" data-walkthrough="invoice-timeline">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div>
            <CardTitle>Activity timeline</CardTitle>
            <CardDescription className="mt-1">
              Every reminder, open, and payment — in order.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/app/invoices/${invoiceId}/history`} className="flex items-center gap-1 text-slate-600 hover:text-slate-900">
              View history
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        
        {/* Summary Strip */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200">
          <div>
            <span className="text-xs text-slate-600 font-medium">Outstanding: </span>
            <span className="text-sm font-semibold text-slate-900">£{outstanding.toFixed(2)}</span>
          </div>
          {lastSeen && (
            <div>
              <span className="text-xs text-slate-600 font-medium">Last seen: </span>
              <span className="text-sm text-slate-900">
                {formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}
              </span>
            </div>
          )}
          {isOverdue && (
            <Badge variant="destructive" className="ml-auto">
              Overdue
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">No activity yet.</p>
            <p className="text-sm text-slate-500">Activity will appear here as reminders are sent and payments are received.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
            
            {/* Timeline items */}
            <div className="space-y-6">
              {events.map((event) => {
                const isOpened = event.type === 'reminder_opened'
                const openCount = event.meta?.open_count || 0
                
                return (
                  <div key={event.id} className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getEventIconBg(event)}`}>
                      {getEventIcon(event)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-medium text-slate-900">
                          {getEventTitle(event)}
                        </span>
                        {isOpened && openCount > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            Viewed {openCount}×
                          </Badge>
                        )}
                        {event.type === 'reminder_sent' && !isOpened && (
                          <Badge variant="outline" className="text-slate-600 text-xs">
                            Not opened yet
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {format(new Date(event.timestamp), 'd MMMM \'at\' h:mm a')}
                        {isOpened && event.meta?.first_opened_at && (
                          <span className="ml-2 text-xs">
                            (First opened {format(new Date(event.meta.first_opened_at), 'd MMM \'at\' h:mm a')})
                          </span>
                        )}
                      </p>
                      {event.meta?.note && (
                        <p className="text-sm text-slate-600 mt-1 italic">"{event.meta.note}"</p>
                      )}
                      {event.type === 'reminder_failed' && (
                        <p className="text-sm text-red-600 mt-1">Failed to send</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
