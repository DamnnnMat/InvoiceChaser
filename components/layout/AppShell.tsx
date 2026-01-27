'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  FileText, 
  Mail, 
  Settings, 
  CreditCard, 
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Search
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import TrialBanner from '@/components/onboarding/TrialBanner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface Subscription {
  status: string
}

export default function AppShell({ 
  children,
  trialEndsAt,
  subscription,
}: { 
  children: React.ReactNode
  trialEndsAt: string | null
  subscription: Subscription | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/invoices', label: 'Invoices', icon: FileText },
    { path: '/app/templates', label: 'Templates', icon: Mail },
    { path: '/app/settings', label: 'Settings', icon: Settings },
    { path: '/app/billing', label: 'Billing', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Beta Ribbon Banner */}
      <div className="w-full bg-slate-100 border-b border-slate-200 text-slate-700 text-center py-1.5 px-4 text-xs font-normal">
        <div className="flex items-center justify-center gap-2">
          <span className="text-slate-600">🧪 We're in Beta — Your feedback helps us improve!</span>
          <Link 
            href="/app/feedback" 
            className="text-slate-700 hover:text-slate-900 underline font-medium transition-colors"
          >
            Share feedback
          </Link>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-slate-900">InvoiceSeen</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Dark Sidebar */}
      <aside
        className={cn(
          "fixed top-[33px] bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">InvoiceSeen</span>
              <p className="text-xs text-slate-400">Payment Operations</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-4 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-slate-600 h-9"
                readOnly
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Overview</p>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full flex items-center justify-center py-2">
                    <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 text-xs">
                      🧪 Beta — feedback welcome
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>We're actively improving InvoiceSeen. Your feedback helps shape the product.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3 text-slate-400" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-72 pt-[33px]">
        <TrialBanner trialEndsAt={trialEndsAt} subscription={subscription} />
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}
