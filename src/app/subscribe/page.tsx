'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser, useAuth, SignInButton } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { hasSubscriberAccess, isAdmin } from '@/lib/user-roles'

export default function SubscribePage() {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser()
  const { getToken } = useAuth()
  const { userData, isLoaded: userLoaded } = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSubscribed = hasSubscriberAccess(userData?.role)

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
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
      const token = await getToken()
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
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
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="h-10 bg-stone-200 dark:bg-slate-700 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-5 bg-stone-200 dark:bg-slate-700 rounded w-48 mx-auto animate-pulse" />
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-violet-50 dark:bg-slate-700 p-6 text-center animate-pulse">
                <div className="h-6 bg-violet-200 dark:bg-slate-600 rounded w-32 mx-auto mb-3" />
                <div className="h-10 bg-violet-200 dark:bg-slate-600 rounded w-20 mx-auto" />
              </div>
              <div className="p-8 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-stone-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-full" />
                  </div>
                ))}
                <div className="h-12 bg-stone-200 dark:bg-slate-700 rounded-xl mt-8" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-slate-100 mb-3">
            Subscribe
          </h1>
          <p className="text-lg text-neutral-600 dark:text-slate-300">
            Unlock all deck guides and expert strategies
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 overflow-hidden">
            {/* Pricing Header */}
            <div className="bg-violet-50 dark:bg-slate-700 p-6 text-center">
              <h2 className="text-lg font-semibold text-neutral-700 dark:text-slate-200 mb-2">Monthly Access</h2>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-neutral-800 dark:text-slate-100">$20</span>
                <span className="text-neutral-500 dark:text-slate-400">/month</span>
              </div>
            </div>

            {/* Features */}
            <div className="p-8">
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-neutral-600 dark:text-slate-300">Comprehensive deck guides</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-neutral-600 dark:text-slate-300">Every relevant matchup explained</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-neutral-600 dark:text-slate-300">120+ gameplay videos and analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-neutral-600 dark:text-slate-300">Constant updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-neutral-600 dark:text-slate-300">Easy to navigate site, mobile friendly</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-neutral-600 dark:text-slate-300">Discussion and comments</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-neutral-600 dark:text-slate-300">Cancel anytime</span>
                </li>
              </ul>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer">
                      Sign In to Subscribe
                    </button>
                  </SignInButton>
                  <p className="text-center text-sm text-neutral-500 dark:text-slate-400 mt-4">
                    <Link href="/about" className="text-violet-600 dark:text-violet-400 hover:underline">
                      Learn more about us
                    </Link>
                  </p>
                </>
              ) : isSubscribed ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-green-700 dark:text-green-400 font-medium">
                      {isAdmin(userData?.role) ? 'You have admin access!' : "You're subscribed!"}
                    </p>
                  </div>
                  {!isAdmin(userData?.role) && (
                    <button
                      onClick={handleManageSubscription}
                      disabled={loading}
                      className="w-full bg-stone-100 dark:bg-slate-700 text-neutral-700 dark:text-slate-300 font-medium px-6 py-3 rounded-xl hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Manage Subscription'}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Subscribe Now'}
                  </button>
                  <p className="text-center text-sm text-neutral-500 dark:text-slate-400 mt-4">
                    <Link href="/about" className="text-violet-600 dark:text-violet-400 hover:underline">
                      Learn more about us
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-neutral-500 dark:text-slate-400 mt-6">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </main>
  )
}
