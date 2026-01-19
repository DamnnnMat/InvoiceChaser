'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Plus, Search, Filter, MoreVertical, Mail, Eye, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PageHeader from '@/components/layout/PageHeader'
import InvoiceForm from './InvoiceForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'overdue' | 'paid'>('all')
  const router = useRouter()

  if (!hasSubscription) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-slate-600">Active subscription required. Please subscribe in <a href="/app/billing" className="text-primary hover:underline">Billing</a>.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Compute stats
  const stats = useMemo(() => {
    const now = new Date()
    const overdue = invoices.filter(inv => !inv.is_paid && new Date(inv.due_date) < now).length
    const dueSoon = invoices.filter(inv => {
      if (inv.is_paid) return false
      const dueDate = new Date(inv.due_date)
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue <= 7 && daysUntilDue >= 0
    }).length
    const totalOutstanding = invoices
      .filter(inv => !inv.is_paid)
      .reduce((sum, inv) => sum + inv.amount, 0)

    return { overdue, dueSoon, totalOutstanding }
  }, [invoices])

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = 
        inv.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.client_email.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (!matchesSearch) return false

      if (statusFilter === 'paid') return inv.is_paid
      if (statusFilter === 'overdue') {
        return !inv.is_paid && new Date(inv.due_date) < new Date()
      }
      if (statusFilter === 'upcoming') {
        return !inv.is_paid && new Date(inv.due_date) >= new Date()
      }
      return true
    })
  }, [invoices, searchQuery, statusFilter])

  const getStatus = (invoice: Invoice) => {
    if (invoice.is_paid) return 'paid'
    const dueDate = new Date(invoice.due_date)
    const now = new Date()
    if (dueDate < now) return 'overdue'
    return 'upcoming'
  }

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Manage your invoices and track payments"
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice
          </Button>
        }
      />

      <div className="p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Overdue</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.overdue}</div>
              <p className="text-xs text-slate-500 font-medium">Invoices past due date</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Due Soon</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 mb-2">{stats.dueSoon}</div>
              <p className="text-xs text-slate-500 font-medium">Due within 7 days</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Outstanding</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-2">£{stats.totalOutstanding.toFixed(2)}</div>
              <p className="text-xs text-slate-500 font-medium">Unpaid invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'upcoming' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('upcoming')}
                >
                  Upcoming
                </Button>
                <Button
                  variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('overdue')}
                >
                  Overdue
                </Button>
                <Button
                  variant={statusFilter === 'paid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('paid')}
                >
                  Paid
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="border-slate-200">
          <CardContent className="p-0">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No invoices found</p>
                <Button onClick={() => setShowForm(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.client_name}</div>
                          <div className="text-sm text-slate-500">{invoice.client_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">£{invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatus(invoice)}>
                          {getStatus(invoice).charAt(0).toUpperCase() + getStatus(invoice).slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <InvoiceActions invoice={invoice} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <InvoiceForm
        open={showForm}
        onSuccess={() => {
          setShowForm(false)
          router.refresh()
        }}
        onCancel={() => setShowForm(false)}
      />
    </>
  )
}

function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter()
  const [resendDialogOpen, setResendDialogOpen] = useState(false)

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/app/invoices/${invoice.id}`)}>
          <Eye className="h-4 w-4 mr-2" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleMarkPaid}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {invoice.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setResendDialogOpen(true)}>
          <Mail className="h-4 w-4 mr-2" />
          Resend Email
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ResendEmailDialog
        invoice={invoice}
        open={resendDialogOpen}
        onOpenChange={setResendDialogOpen}
      />
    </DropdownMenu>
  )
}

function ResendEmailDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [reminderType, setReminderType] = useState<'before_due' | 'on_due' | 'after_due'>('before_due')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleResend = async () => {
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

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send email')
      }

      setMessage('Email sent successfully!')
      setTimeout(() => {
        onOpenChange(false)
        router.refresh()
      }, 1500)
    } catch (error: any) {
      setMessage(error.message || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="before_due">Friendly Reminder (Before Due)</option>
              <option value="on_due">Firm Reminder (On Due Date)</option>
              <option value="after_due">Final Notice (After Due Date)</option>
            </select>
          </div>
          {message && (
            <div className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleResend} disabled={loading}>
            {loading ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
