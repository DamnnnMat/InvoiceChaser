'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Mail, Eye, Clock, Zap, CheckCircle2, TrendingUp, FileText, Bell, Send } from 'lucide-react'

export default function LandingPage() {
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
          zIndex: 0
        }}
      />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-[72px] flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            InvoiceSeen
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Login
            </Link>
            <Button asChild className="bg-[#18181B] hover:bg-[#18181B]/90 text-white rounded-lg px-4 py-2">
              <Link href="/request-access">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 pt-[72px] relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen">
          {/* Content Container */}
          <div className="container mx-auto px-4 pt-8 pb-24 md:pt-12 md:pb-32 relative z-10">
            <div className="mx-auto max-w-[64rem] space-y-8">
              {/* New Badge */}
              <div className="flex justify-center">
                <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-sm text-muted-foreground">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-600 animate-flicker"></span>
                  <b>New</b>: See when your payment reminders are opened
                </span>
              </div>
              
              {/* Hero Title */}
              <h1 className="text-center text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Stop chasing invoices.
                <br />
                <span className="bg-gradient-to-r from-blue-600/60 to-indigo-600 bg-clip-text text-transparent">
                  Start getting paid.
                </span>
              </h1>
              
              {/* Hero Description */}
              <p className="mx-auto max-w-2xl text-center text-lg text-muted-foreground font-light leading-relaxed">
                InvoiceSeen shows you exactly when your payment reminders are opened, so you know when to follow up, escalate, or wait.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-medium text-white transition-colors hover:bg-blue-700 group"
                >
                  <Link href="/request-access">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-gray-200 px-8 text-sm font-medium transition-colors hover:bg-gray-100"
                >
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>

              {/* Trusted By Section */}
              <div className="mt-24 space-y-4">
                <p className="text-center text-sm text-muted-foreground font-light">
                  Trusted by freelancers & businesses everywhere
                </p>
                <div className="relative mx-auto max-w-2xl">
                  {/* Fade gradients */}
                  <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
                  
                  {/* Scrolling content - companies testing the platform */}
                  <div className="overflow-hidden relative">
                    <div className="flex whitespace-nowrap animate-marquee">
                      {[...Array(2)].flatMap((_, i) => (
                        ['Corespace', 'Profiled.io', 'Acorn Accountants', 'Quantax'].map((company) => (
                          <span 
                            key={`${company}-${i}`} 
                            className="inline-block mx-6 text-xl font-semibold tracking-tight text-muted-foreground/60"
                          >
                            {company}
                          </span>
                        ))
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <section className="container mx-auto px-4 pt-2">
                <div className="mx-auto max-w-[64rem]">
                  <div className="rounded-2xl bg-white p-12 shadow-[0_1px_3px_0_rgb(0,0,0,0.1)] border border-gray-200">
                    {/* Header */}
                    <div className="space-y-4">
                      <span className="text-base text-muted-foreground">
                        From manual follow-ups to confident payment recovery
                      </span>
                      <h2 className="text-4xl font-medium tracking-tight">
                        Invoice reminders with real visibility.
                      </h2>
                      <p className="text-xl text-muted-foreground max-w-3xl">
                        InvoiceSeen automatically sends polite reminders and shows you when they're opened — so you know when to follow up, escalate, or wait.
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                        {/* Stat 1 */}
                        <div className="space-y-2">
                          <h3 className="text-4xl font-medium text-blue-600">100%</h3>
                          <h4 className="font-medium">Automated</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Set it once. We handle every follow-up.
                          </p>
                        </div>

                        {/* Stat 2 */}
                        <div className="space-y-2">
                          <h3 className="text-4xl font-medium text-blue-600">24/7</h3>
                          <h4 className="font-medium">Visibility</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Know exactly when reminders are opened.
                          </p>
                        </div>

                        {/* Stat 3 */}
                        <div className="space-y-2">
                          <h3 className="text-4xl font-medium text-blue-600">0</h3>
                          <h4 className="font-medium">Awkward Chasing</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            No uncomfortable calls or guessing games.
                          </p>
                        </div>

                        {/* Stat 4 */}
                        <div className="space-y-2">
                          <h3 className="text-4xl font-medium text-blue-600">∞</h3>
                          <h4 className="font-medium">Unlimited History</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Every reminder, open, and payment — in one timeline.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section id="how-it-works" className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-[64rem] space-y-12">
                  {/* Section Header */}
                  <div className="text-center space-y-4">
                    <h2 className="text-5xl font-medium tracking-tight">
                      How InvoiceSeen works{' '}<br />
                      <span className="font-light italic">for</span>{' '}
                      <span className="text-gray-500">you.</span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                      Simple setup. Automatic reminders. Complete visibility.
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                    {/* Feature 1 */}
                    <div className="space-y-6">
                      <div className="aspect-square bg-gray-50 rounded-xl p-8 relative flex items-center justify-center">
                        <div className="w-24 h-24 rounded-2xl bg-blue-100 flex items-center justify-center">
                          <FileText className="h-12 w-12 text-blue-600" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-medium">Add your invoice in seconds</h3>
                        <p className="text-muted-foreground">
                          Enter your client, amount, and due date — no accounting setup, no complexity.
                        </p>
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="space-y-6">
                      <div className="aspect-square bg-gray-50 rounded-xl p-8 relative flex items-center justify-center">
                        <div className="w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center">
                          <Mail className="h-12 w-12 text-indigo-600" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-medium">We handle the follow-ups</h3>
                        <p className="text-muted-foreground">
                          Polite reminders are sent automatically before, on, and after the due date.
                        </p>
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="space-y-6">
                      <div className="aspect-square bg-gray-50 rounded-xl p-8 relative flex items-center justify-center">
                        <div className="w-24 h-24 rounded-2xl bg-purple-100 flex items-center justify-center">
                          <Eye className="h-12 w-12 text-purple-600" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-medium">Know when it's been seen</h3>
                        <p className="text-muted-foreground">
                          See exactly when your reminder is opened, so you know when to act with confidence.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Closing Statement */}
                  <div className="text-center mt-12">
                    <p className="text-xl font-medium text-slate-900">
                      Stop guessing. Follow up at the right moment — every time.
                    </p>
                  </div>
                </div>
              </section>

              {/* Email History Visual Section */}
              <section className="container mx-auto px-4 py-16 bg-white">
                <div className="mx-auto max-w-[64rem]">
                  <div className="text-center space-y-4 mb-12">
                    <h2 className="text-4xl font-medium">Know when it's been seen</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      See exactly when a client opens your payment reminder — no more guessing or unnecessary follow-ups.
                    </p>
                  </div>
                  
                  {/* Visual Card */}
                  <Card className="border-2 border-gray-200 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Email History</CardTitle>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          View history
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                        
                        {/* Timeline items */}
                        <div className="space-y-6">
                          {/* Reminder sent */}
                          <div className="relative flex items-start gap-4">
                            <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <Send className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 pt-1">
                              <span className="font-medium text-slate-900">Reminder sent</span>
                              <p className="text-sm text-slate-500">16 April at 8:45 AM</p>
                            </div>
                          </div>
                          
                          {/* Opened */}
                          <div className="relative flex items-start gap-4">
                            <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <Eye className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-medium text-slate-900">Opened</span>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-slate-900">Opened</span>
                                  <span className="text-xs text-slate-500">16 April at 9:17 AM</span>
                                </div>
                              </div>
                              <p className="text-sm text-slate-500">16 April at 9:17 AM</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Send new reminder button */}
                        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center">
                          <Button className="rounded-lg">
                            Send new reminder
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Note: Replace with actual GIF/image when available */}
                  <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p>Visual representation of email tracking timeline</p>
                  </div>
                </div>
              </section>

              {/* Benefits Section */}
              <section className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-[64rem] space-y-12">
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-medium">Why choose InvoiceSeen</h2>
                    <p className="text-xl text-muted-foreground">
                      Get paid with confidence by knowing exactly when clients see your reminders.
                    </p>
                  </div>

                  {/* Benefits Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Benefit 1 */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8">
                      <div className="space-y-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-medium">Know when it's been seen</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          See exactly when a client opens your payment reminder — no more guessing or unnecessary follow-ups.
                        </p>
                      </div>
                    </div>

                    {/* Benefit 2 */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8">
                      <div className="space-y-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-medium">Follow-ups, handled</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Set your schedule once and let InvoiceSeen send polite reminders at the right time.
                        </p>
                      </div>
                    </div>

                    {/* Benefit 3 */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8">
                      <div className="space-y-4">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-medium">Professional, on-brand emails</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Personalise reminder emails to match your tone while staying effective.
                        </p>
                      </div>
                    </div>

                    {/* Benefit 4 */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8">
                      <div className="space-y-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-medium">Full reminder timeline</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Every reminder sent, every open tracked, and every payment — all in one place.
                        </p>
                      </div>
                    </div>

                    {/* Benefit 5 */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8">
                      <div className="space-y-4">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Bell className="h-5 w-5 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-medium">Resend when it makes sense</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          One-click resend when you know a reminder has been seen — or ignored.
                        </p>
                      </div>
                    </div>

                    {/* Benefit 6 */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8">
                      <div className="space-y-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-medium">Stop chasing. Start collecting.</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Follow up at the right moment and reclaim hours every week.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing Section */}
              <section id="pricing" className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-[64rem] space-y-8 text-center">
                  {/* Header */}
                  <div className="space-y-4">
                    <h2 className="text-4xl font-medium">Simple pricing. Complete certainty.</h2>
                  </div>

                  {/* Pricing Card */}
                  <div className="mt-12 flex justify-center">
                    <div className="rounded-xl border-2 border-blue-200 bg-white p-8 relative max-w-md w-full">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-medium">InvoiceSeen Pro</h3>
                        </div>

                        <div className="space-y-1">
                          <p className="text-5xl font-medium">£9</p>
                          <p className="text-muted-foreground">/ month</p>
                          <p className="text-sm text-muted-foreground mt-2">Less than the cost of one late invoice.</p>
                        </div>

                        <ul className="space-y-4 pt-4">
                          {[
                            'Email open tracking on every reminder',
                            'Automated reminder scheduling',
                            'Unlimited invoices & reminders',
                            'Complete reminder history',
                            'Custom email templates',
                            'Manual resend anytime',
                          ].map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground text-sm text-left">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-8">
                          <Button
                            asChild
                            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                          >
                            <Link href="/request-access">
                              Get started
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Final CTA */}
              <section className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-[64rem] space-y-8 text-center">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-medium">Ready to stop guessing and start getting paid?</h2>
                    <p className="text-lg text-muted-foreground">
                      Know when your reminders are opened and follow up with confidence.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <Link href="/request-access">
                      Get started free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </section>

              {/* Footer */}
              <footer className="relative bg-white border-t border-gray-200">
                <div className="container mx-auto px-4 py-12">
                  <div className="flex flex-col items-center gap-8">
                    {/* Logo */}
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      InvoiceSeen
                    </div>
                    
                    {/* Links */}
                    <ul className="flex flex-wrap justify-center gap-8">
                      <li>
                        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link href="/request-access" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Sign Up
                        </Link>
                      </li>
                      <li>
                        <a href="mailto:support@invoiceseen.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          support@invoiceseen.com
                        </a>
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground">
                      &copy; {new Date().getFullYear()} InvoiceSeen. All rights reserved.
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-flicker {
          animation: flicker 2s infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
