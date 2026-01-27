'use client'

import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowLeft, CheckCircle2, XCircle, Mail, Send, Eye, Clock, User, Zap, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PageHeader from '@/components/layout/PageHeader'

interface Invoice {
  id: string
  client_name: string
  client_email: string
  amount: number
  due_date: string
  is_paid: boolean
}

interface Template {
  id: string
  subject: string
  body: string
  template_type: string
}

interface Reminder {
  id: string
  reminder_type: string
  sent_at: string
  status: string
  error_message: string | null
  opened_at: string | null
  open_count: number
  is_manual: boolean
  template_id: string | null
  template_type: string | null
  template?: Template | null
}

export default function InvoiceHistoryClient({
  invoice,
  reminders,
}: {
  invoice: Invoice
  reminders: Reminder[]
}) {
  const router = useRouter()

  const getReminderTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      before_due: 'Before Due Date',
      on_due: 'On Due Date',
      after_due: 'After Due Date',
    }
    return labels[type] || type
  }

  const getTemplateTypeLabel = (type: string | null) => {
    if (!type) return 'Default'
    const labels: { [key: string]: string } = {
      friendly: 'Friendly Reminder',
      firm: 'Firm Reminder',
      final: 'Final Notice',
    }
    return labels[type] || type
  }

  return (
    <>
      <PageHeader
        title="Email History"
        description={`Complete audit trail for ${invoice.client_name}`}
        action={
          <Button variant="outline" onClick={() => router.push(`/app/invoices/${invoice.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoice
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Invoice Summary Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <User className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600 font-medium">Client</p>
                  <p className="text-sm font-semibold text-slate-900">{invoice.client_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Mail className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600 font-medium">Email</p>
                  <p className="text-sm font-semibold text-slate-900">{invoice.client_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <FileText className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600 font-medium">Amount</p>
                  <p className="text-sm font-semibold text-slate-900">£{invoice.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed History */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Complete Reminder History</CardTitle>
            <CardDescription>
              Full audit trail of all reminders sent, including template details and delivery status
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
              <div className="space-y-6">
                {reminders.map((reminder) => {
                  const isOpened = reminder.opened_at !== null
                  const openCount = reminder.open_count || 0
                  
                  return (
                    <Card key={reminder.id} className="border-slate-200">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header Row */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                reminder.status === 'sent' 
                                  ? isOpened 
                                    ? 'bg-blue-100' 
                                    : 'bg-green-100'
                                  : 'bg-red-100'
                              }`}>
                                {reminder.status === 'sent' ? (
                                  isOpened ? (
                                    <Eye className="h-5 w-5 text-blue-600" />
                                  ) : (
                                    <Send className="h-5 w-5 text-green-600" />
                                  )
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900">
                                  {getReminderTypeLabel(reminder.reminder_type)}
                                </h3>
                                <p className="text-sm text-slate-500">
                                  {format(new Date(reminder.sent_at), 'PPpp')}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={reminder.status === 'sent' ? 'default' : 'destructive'}>
                                {reminder.status === 'sent' ? 'Sent' : 'Failed'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {reminder.is_manual ? (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Manual
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    Automated
                                  </span>
                                )}
                              </Badge>
                            </div>
                          </div>

                          {/* Template Information */}
                          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-slate-200">
                            <div>
                              <p className="text-xs text-slate-600 font-medium mb-1">Template Used</p>
                              <p className="text-sm text-slate-900">
                                {reminder.template 
                                  ? reminder.template.subject 
                                  : getTemplateTypeLabel(reminder.template_type)}
                              </p>
                              {reminder.template && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Type: {getTemplateTypeLabel(reminder.template.template_type)}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 font-medium mb-1">Template Type</p>
                              <Badge variant="outline" className="text-xs">
                                {getTemplateTypeLabel(reminder.template_type)}
                              </Badge>
                            </div>
                          </div>

                          {/* Open Tracking */}
                          {reminder.status === 'sent' && (
                            <div className="pt-4 border-t border-slate-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-slate-600 font-medium mb-1">Open Status</p>
                                  {isOpened ? (
                                    <div className="flex items-center gap-2">
                                      <Eye className="h-4 w-4 text-green-600" />
                                      <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                                        Opened {openCount > 1 && `${openCount} times`}
                                      </Badge>
                                      {reminder.opened_at && (
                                        <span className="text-xs text-slate-500">
                                          First opened: {format(new Date(reminder.opened_at), 'PPpp')}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="text-slate-600">
                                      Not opened
                                    </Badge>
                                  )}
                                </div>
                                {reminder.tracking_id && (
                                  <div>
                                    <p className="text-xs text-slate-600 font-medium mb-1">Tracking ID</p>
                                    <p className="text-xs font-mono text-slate-500">{reminder.tracking_id}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Error Details */}
                          {reminder.status === 'failed' && reminder.error_message && (
                            <div className="pt-4 border-t border-slate-200">
                              <p className="text-xs text-slate-600 font-medium mb-2">Error Details</p>
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700 font-mono text-xs break-all">
                                  {reminder.error_message}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Template Preview (if available) */}
                          {reminder.template && (
                            <div className="pt-4 border-t border-slate-200">
                              <p className="text-xs text-slate-600 font-medium mb-2">Template Preview</p>
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="text-xs font-semibold text-slate-900 mb-1">
                                  Subject: {reminder.template.subject}
                                </p>
                                <p className="text-xs text-slate-600 line-clamp-3">
                                  {reminder.template.body}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
