import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PrivateBetaClient from '@/components/private-beta/PrivateBetaClient'

export default function PrivateBetaPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          InvoiceSeen is in private beta
        </h1>
        <p className="text-slate-600">
          Access is by invite only. Request access and we&apos;ll email you when a spot opens.
        </p>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/">Request access</Link>
        </Button>
        <PrivateBetaClient />
      </div>
    </div>
  )
}
