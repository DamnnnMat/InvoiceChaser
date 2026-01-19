'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import './AppShell.css'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { path: '/app/invoices', label: 'Invoices' },
    { path: '/app/templates', label: 'Templates' },
    { path: '/app/settings', label: 'Settings' },
    { path: '/app/billing', label: 'Billing' },
  ]

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="nav-brand">Invoice Chaser</div>
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  )
}
