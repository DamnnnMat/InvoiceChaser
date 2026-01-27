'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface WalkthroughStep {
  id: string
  page: string // Route to navigate to
  title: string
  content: string
  highlightSelector?: string // Optional: element to highlight
}

interface WalkthroughProps {
  hasSeenWalkthrough: boolean
  onComplete: () => void
  onSkip: () => void
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'dashboard',
    page: '/app/dashboard',
    title: '👋 Welcome to InvoiceSeen',
    content: 'We help you track when clients open invoice reminders — so you know exactly when to follow up.',
    highlightSelector: '[data-walkthrough="dashboard-header"]',
  },
  {
    id: 'invoices-list',
    page: '/app/invoices',
    title: '👀 This is where engagement shows up',
    content: "When a client opens a reminder email, you'll see it here — no more guessing.",
    highlightSelector: '[data-walkthrough="invoices-list"]',
  },
  {
    id: 'invoice-detail',
    page: '/app/invoices',
    title: 'Opened · Unpaid means action needed',
    content: "'Opened · Unpaid' means the client saw your reminder but hasn't paid yet. This is your signal to follow up with confidence.",
    highlightSelector: '[data-walkthrough="invoice-status"]', // Point to status column in invoices table
  },
  {
    id: 'templates',
    page: '/app/templates',
    title: 'Templates power automatic reminders',
    content: 'These templates are designed to increase open and payment response rates. InvoiceSeen sends and tracks them automatically.',
    highlightSelector: '[data-walkthrough="templates"]',
  },
]

export default function Walkthrough({
  hasSeenWalkthrough,
  onComplete,
  onSkip,
}: WalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (hasSeenWalkthrough) {
      return
    }

    // Start walkthrough after a short delay
    const timer = setTimeout(() => {
      setIsOpen(true)
      const step = WALKTHROUGH_STEPS[currentStep]
      if (step && !window.location.pathname.includes(step.page)) {
        router.push(step.page)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [hasSeenWalkthrough, currentStep, router])

  useEffect(() => {
    if (!isOpen || hasSeenWalkthrough) return

    const step = WALKTHROUGH_STEPS[currentStep]
    if (!step) return

    // Navigate to the right page
    const currentPath = window.location.pathname
    if (!currentPath.includes(step.page)) {
      router.push(step.page)
      // Wait for navigation before highlighting
      setTimeout(() => {
        highlightElement(step.highlightSelector)
      }, 500)
    } else {
      // Already on the right page, highlight immediately
      setTimeout(() => {
        highlightElement(step.highlightSelector)
      }, 100)
    }
  }, [currentStep, isOpen, router, hasSeenWalkthrough])

  const highlightElement = (selector?: string) => {
    if (!selector) return
    
    // Try multiple times in case element hasn't loaded yet
    let attempts = 0
    const maxAttempts = 5
    
    const tryHighlight = () => {
      const element = document.querySelector(selector) as HTMLElement
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add highlight class with transition
        element.style.transition = 'all 0.3s ease'
        element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2')
        if (element.classList.contains('rounded') === false) {
          element.style.borderRadius = '8px'
        }
      } else if (attempts < maxAttempts) {
        attempts++
        setTimeout(tryHighlight, 300)
      }
      // If element not found after max attempts, continue anyway (non-blocking)
    }
    
    tryHighlight()
  }

  const removeHighlights = () => {
    WALKTHROUGH_STEPS.forEach(step => {
      if (step.highlightSelector) {
        const element = document.querySelector(step.highlightSelector) as HTMLElement
        if (element) {
          element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2')
          element.style.borderRadius = ''
        }
      }
    })
  }

  const handleNext = () => {
    removeHighlights()

    if (currentStep < WALKTHROUGH_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = async () => {
    removeHighlights()
    setIsOpen(false)
    await markComplete()
    onSkip()
  }

  const handleComplete = async () => {
    removeHighlights()
    setIsOpen(false)
    await markComplete()
    onComplete()
  }

  const markComplete = async () => {
    try {
      await fetch('/api/user/complete-walkthrough', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error completing walkthrough:', error)
    }
  }

  if (hasSeenWalkthrough || !isOpen || currentStep >= WALKTHROUGH_STEPS.length) {
    return null
  }

  const step = WALKTHROUGH_STEPS[currentStep]
  const isLastStep = currentStep === WALKTHROUGH_STEPS.length - 1

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleSkip}
      />

      {/* Walkthrough card - fixed position */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <Card className="w-full max-w-md mx-4 border-2 border-blue-500 shadow-2xl pointer-events-auto">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.content}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-2"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-slate-500"
              >
                Skip tour
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {currentStep + 1} of {WALKTHROUGH_STEPS.length}
                </span>
                <Button
                  size="sm"
                  onClick={isLastStep ? handleComplete : handleNext}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Got it
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
