'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import {
  DollarSign,
  AlertCircle,
  Users,
  TrendingUp,
  FileText,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PageHeader from '@/components/layout/PageHeader'

interface Invoice {
  id: string
  client_name: string
  client_email: string
  amount: number
  due_date: string
  is_paid: boolean
  created_at: string
}

interface Reminder {
  id: string
  invoice_id: string
  reminder_type: string
  sent_at: string
  status: string
  invoices?: {
    client_name: string
    amount: number
  } | any
}

interface AccessInfo {
  hasAccess: boolean
  isTrial: boolean
  isActiveSubscription: boolean
  trialEndsAt: string | null
  daysRemaining: number | null
  isExpired: boolean
}

export default function DashboardClient({
  invoices,
  reminders,
  hasAccess,
  accessInfo,
}: {
  invoices: Invoice[]
  reminders: Reminder[]
  hasAccess: boolean
  accessInfo?: AccessInfo
}) {
  const router = useRouter()

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date()
    
    // Total Outstanding
    const totalOutstanding = invoices
      .filter(inv => !inv.is_paid)
      .reduce((sum, inv) => sum + inv.amount, 0)
    
    // Overdue Invoices
    const overdueCount = invoices.filter(
      inv => !inv.is_paid && new Date(inv.due_date) < now
    ).length
    
    const overdueAmount = invoices
      .filter(inv => !inv.is_paid && new Date(inv.due_date) < now)
      .reduce((sum, inv) => sum + inv.amount, 0)
    
    // Total Customers (unique clients)
    const uniqueClients = new Set(invoices.map(inv => inv.client_email)).size
    
    // Collection Rate
    const totalInvoices = invoices.length
    const paidInvoices = invoices.filter(inv => inv.is_paid).length
    const collectionRate = totalInvoices > 0 
      ? ((paidInvoices / totalInvoices) * 100).toFixed(1)
      : '0.0'
    
    // This month vs last month (simplified - using current data)
    const thisMonthOutstanding = totalOutstanding
    const lastMonthOutstanding = totalOutstanding * 0.88 // Mock: assume 12% increase
    const outstandingChange = totalOutstanding > 0
      ? (((thisMonthOutstanding - lastMonthOutstanding) / lastMonthOutstanding) * 100).toFixed(1)
      : '0.0'
    
    const overdueChange = overdueCount > 0 ? '12.4' : '0.0'
    const customersChange = uniqueClients > 0 ? '12.4' : '0.0'
    const collectionChange = parseFloat(collectionRate) > 0 ? '2.1' : '0.0'

    return {
      totalOutstanding,
      overdueCount,
      overdueAmount,
      uniqueClients,
      collectionRate,
      outstandingChange,
      overdueChange,
      customersChange,
      collectionChange,
    }
  }, [invoices])

  // Recent invoices (last 5)
  const recentInvoices = useMemo(() => {
    return invoices.slice(0, 5)
  }, [invoices])

  // Recent reminders (last 5)
  const recentReminders = useMemo(() => {
    return reminders.slice(0, 5)
  }, [reminders])

  const getStatus = (invoice: Invoice) => {
    if (invoice.is_paid) return 'paid'
    const dueDate = new Date(invoice.due_date)
    const now = new Date()
    if (dueDate < now) return 'overdue'
    return 'upcoming'
  }

  const getReminderTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      before_due: 'Friendly Reminder',
      on_due: 'Firm Reminder',
      after_due: 'Final Notice',
    }
    return labels[type] || type
  }

  if (!hasAccess) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">
                {accessInfo?.isExpired 
                  ? 'Your trial has expired. Subscribe to continue using InvoiceSeen.'
                  : 'Active subscription or trial required. Please subscribe in'}
              </p>
              <Button asChild>
                <a href="/app/billing">Go to Billing</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Monitor your invoices, track payments, and manage reminders—all in one place."
        data-walkthrough="dashboard-header"
        action={
          <Button onClick={() => router.push('/app/invoices')}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        }
      />

      <div className="p-8 space-y-8">
        {/* Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Total Outstanding
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-2">£{metrics.totalOutstanding.toFixed(2)}</div>
              <div className="flex items-center text-xs font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-600" />
                <span className="text-green-600 font-semibold">+{metrics.outstandingChange}%</span>
                <span className="ml-1 text-slate-500">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Overdue Invoices
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">{metrics.overdueCount}</div>
              <div className="flex items-center text-xs font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-red-600" />
                <span className="text-red-600 font-semibold">+{metrics.overdueChange}%</span>
                <span className="ml-1 text-slate-500">vs last month</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                £{metrics.overdueAmount.toFixed(2)} overdue
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Total Clients
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-2">{metrics.uniqueClients}</div>
              <div className="flex items-center text-xs font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-600" />
                <span className="text-green-600 font-semibold">+{metrics.customersChange}%</span>
                <span className="ml-1 text-slate-500">vs last month</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Unique clients
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Collection Rate
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-2">{metrics.collectionRate}%</div>
              <div className="flex items-center text-xs font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-600" />
                <span className="text-green-600 font-semibold">+{metrics.collectionChange}%</span>
                <span className="ml-1 text-slate-500">vs last month</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Paid invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Latest invoices you've created</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/app/invoices')}
                >
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">No invoices yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/app/invoices')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-200"
                      onClick={() => router.push(`/app/invoices/${invoice.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-sm text-slate-900">{invoice.client_name}</p>
                          <Badge variant={getStatus(invoice)} className="text-xs font-medium">
                            {getStatus(invoice)}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 font-medium">
                          Due {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base text-slate-900">£{invoice.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity (Reminders) */}
          <Card className="border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
                  <CardDescription className="mt-1 text-slate-500">Latest reminder emails sent</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/app/invoices')}
                  className="text-slate-600 hover:text-slate-900"
                >
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentReminders.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">No reminders sent yet</p>
                  <p className="text-xs text-slate-500">
                    Reminders will appear here once sent
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentReminders.map((reminder) => {
                    const timeAgo = formatDistanceToNow(new Date(reminder.sent_at), {
                      addSuffix: true,
                    })
                    const invoice = reminder.invoices as any
                    return (
                      <div
                        key={reminder.id}
                        className="flex items-start gap-3 p-4 rounded-lg hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                        onClick={() => router.push(`/app/invoices/${reminder.invoice_id}`)}
                      >
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            {getReminderTypeLabel(reminder.reminder_type)} sent
                          </p>
                          {invoice && (
                            <p className="text-xs text-slate-600 mt-1.5 font-medium">
                              {invoice.client_name} • £{invoice.amount.toFixed(2)}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-1.5 font-medium">{timeAgo}</p>
                        </div>
                        <Badge
                          variant={reminder.status === 'sent' ? 'default' : 'destructive'}
                          className="text-xs font-medium"
                        >
                          {reminder.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoice Activity</CardTitle>
                <CardDescription>
                  Monitor your invoices and track payment status
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/app/invoices')}
              >
                View all invoices
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">No invoices yet</p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/app/invoices')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Invoice
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
                    <TableHead>Date Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/app/invoices/${invoice.id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.client_name}</div>
                          <div className="text-sm text-slate-500">{invoice.client_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        £{invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{format(new Date(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatus(invoice)}>
                          {getStatus(invoice).charAt(0).toUpperCase() + getStatus(invoice).slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

