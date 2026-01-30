import Link from 'next/link'
import { Button } from '@/components/ui/button'
import WaitlistForm from '@/components/waitlist/WaitlistForm'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* Grid Background */}
      <div
        className="absolute inset-0 w-full"
        style={{
          backgroundImage: `
            linear-gradient(rgb(100 100 100 / 0.03) 1px, transparent 1px),
            linear-gradient(to right, rgb(100 100 100 / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-[72px] flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            InvoiceSeen
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-gray-200">
              <Link href="/signup">Have an invite? Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - Private beta waitlist */}
      <main className="flex-1 pt-[72px] relative z-10 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              InvoiceSeen is in private beta
            </h1>
            <p className="text-lg text-muted-foreground">
              Request access to test InvoiceSeen and help shape the product.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <WaitlistForm />
          </div>
        </div>
      </main>
    </div>
  )
}
