'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { hasSubscriberAccess } from '@/lib/user-roles'

export default function SubscribePage() {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser()
  const { userData, isLoaded: userLoaded } = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSubscribed = hasSubscriberAccess(userData?.role)

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  if (!clerkLoaded || !userLoaded) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-80 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-64 mx-auto animate-pulse" />
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600/50 to-fuchsia-600/50 p-8 text-center animate-pulse">
                <div className="h-8 bg-white/20 rounded w-40 mx-auto mb-4" />
                <div className="h-14 bg-white/20 rounded w-24 mx-auto" />
              </div>
              <div className="p-8 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  </div>
                ))}
                <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl mt-8" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Premium Subscription
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Unlock all deck guides and expert strategies
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
            {/* Pricing Header */}
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Monthly Access</h2>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-white">$20</span>
                <span className="text-purple-200">/month</span>
              </div>
            </div>

            {/* Features */}
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300">Access to all deck guides</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300">Matchup analysis & strategies</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300">Updated decklists</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300">Discussion & comments</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300">Cancel anytime</span>
                </li>
              </ul>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold px-6 py-4 rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-lg shadow-purple-500/25 cursor-pointer">
                      Sign In to Subscribe
                    </button>
                  </SignInButton>
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                    <Link href="/about" className="text-purple-600 dark:text-purple-400 hover:underline">
                      Learn more about us
                    </Link>
                  </p>
                </>
              ) : isSubscribed ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <p className="text-green-700 dark:text-green-300 font-semibold">
                      You&apos;re subscribed!
                    </p>
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-6 py-4 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Manage Subscription'}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold px-6 py-4 rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-lg shadow-purple-500/25 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Subscribe Now'}
                  </button>
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                    <Link href="/about" className="text-purple-600 dark:text-purple-400 hover:underline">
                      Learn more about us
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </main>
  )
}
