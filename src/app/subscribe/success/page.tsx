'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clearUserCache, useCurrentUser } from '@/hooks/useCurrentUser'

const MAX_POLL_ATTEMPTS = 10
const POLL_INTERVAL = 1500 // 1.5 seconds

export default function SubscribeSuccessPage() {
  const { hasSubscriberAccess, isLoaded } = useCurrentUser()
  const [pollCount, setPollCount] = useState(0)
  const [confirmed, setConfirmed] = useState(false)

  // Poll until subscription is confirmed or we hit max attempts
  useEffect(() => {
    if (!isLoaded) return

    if (hasSubscriberAccess) {
      setConfirmed(true)
      return
    }

    if (pollCount >= MAX_POLL_ATTEMPTS) {
      // Give up polling, assume it worked (they can refresh)
      setConfirmed(true)
      return
    }

    const timer = setTimeout(() => {
      clearUserCache()
      setPollCount(prev => prev + 1)
    }, POLL_INTERVAL)

    return () => clearTimeout(timer)
  }, [isLoaded, hasSubscriberAccess, pollCount])

  const isWaiting = !confirmed && pollCount < MAX_POLL_ATTEMPTS

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className={`w-20 h-20 ${isWaiting ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-green-100 dark:bg-green-900/30'} rounded-full flex items-center justify-center mx-auto mb-6`}>
          {isWaiting ? (
            <svg className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {isWaiting ? 'Activating Your Subscription...' : 'Welcome to Premium!'}
        </h1>

        <p className="text-slate-600 dark:text-slate-300 mb-8">
          {isWaiting
            ? 'Please wait while we confirm your payment.'
            : 'Your subscription is now active. You have full access to all deck guides and premium content.'}
        </p>

        {!isWaiting && (
          <Link
            href="/#decks"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-lg shadow-purple-500/25"
          >
            Browse Deck Guides
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </main>
  )
}
