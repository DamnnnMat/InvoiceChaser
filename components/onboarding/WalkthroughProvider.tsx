'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Walkthrough from './Walkthrough'

interface WalkthroughProviderProps {
  hasSeenWalkthrough: boolean
  children: React.ReactNode
}

export default function WalkthroughProvider({
  hasSeenWalkthrough,
  children,
}: WalkthroughProviderProps) {
  const [isComplete, setIsComplete] = useState(hasSeenWalkthrough)
  const router = useRouter()

  const handleComplete = () => {
    setIsComplete(true)
    // Show success toast (using alert for now, can be upgraded to toast)
    setTimeout(() => {
      alert('🎉 You\'re all set — let\'s get your first invoice tracked.')
    }, 300)
  }

  const handleSkip = () => {
    setIsComplete(true)
  }

  if (isComplete) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <Walkthrough
        hasSeenWalkthrough={isComplete}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </>
  )
}
