'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useUser, useAuth, SignInButton } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { hasSubscriberAccess, isAdmin } from '@/lib/user-roles'
import { Button } from '@/components/ui'

type CheckoutErrorKind = 'network' | 'auth' | 'already-subscribed' | 'declined' | 'unknown'

interface TypedError {
  kind: CheckoutErrorKind
  message: string
}

function classifyError(status: number | null, message: string): TypedError {
  const lower = message.toLowerCase()
  if (status === 0 || lower.includes('fetch') || lower.includes('network')) {
    return { kind: 'network', message }
  }
  if (status === 401 || status === 403 || lower.includes('unauthor')) {
    return { kind: 'auth', message }
  }
  if (lower.includes('already') && lower.includes('subscrib')) {
    return { kind: 'already-subscribed', message }
  }
  if (lower.includes('declin') || lower.includes('card')) {
    return { kind: 'declined', message }
  }
  return { kind: 'unknown', message }
}

function ErrorCallout({ error, onRetry }: { error: TypedError; onRetry?: () => void }) {
  const advice: Record<CheckoutErrorKind, string> = {
    network: 'Check your connection and try again.',
    auth: 'Your session may have expired — sign in again.',
    'already-subscribed': 'Refresh the page to see your subscriber benefits.',
    declined: 'Your bank declined the charge. Try a different card.',
    unknown: 'Please try again in a moment.',
  }
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-3 text-sm"
    >
      <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-red-700 dark:text-red-300 font-medium">{error.message}</p>
        <p className="text-red-600/80 dark:text-red-400/80 mt-0.5">{advice[error.kind]}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-700 dark:text-red-300 font-semibold hover:underline cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  )
}

export default function SubscribePage() {
  const t = useTranslations('subscribe')
  const locale = useLocale()
  const { isSignedIn, isLoaded: clerkLoaded } = useUser()
  const { getToken } = useAuth()
  const { userData, isLoaded: userLoaded } = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<TypedError | null>(null)

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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw Object.assign(new Error(data.error || 'Failed to create checkout session'), { status: res.status })
      }

      window.location.href = data.url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : null
      setError(classifyError(status, message))
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
        throw Object.assign(new Error(data.error || 'Failed to open billing portal'), { status: res.status })
      }

      window.location.href = data.url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : null
      setError(classifyError(status, message))
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

  const features = [t('feature1'), t('feature2'), t('feature3'), t('feature4'), t('feature5'), t('feature6'), t('feature7')]

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-neutral-800 dark:text-slate-100 mb-3 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-slate-300">
            {t('subtitle')}
          </p>
        </div>

        {/* Trust strip */}

        <div className="max-w-md mx-auto">
          <div className="relative">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 overflow-hidden">
              {/* Pricing Header */}
              <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-700 dark:to-slate-700/70 p-6 text-center overflow-hidden">
                <div className="relative">
                  <h2 className="text-lg font-semibold text-neutral-700 dark:text-slate-200 mb-2">{t('monthlyAccess')}</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold bg-gradient-to-br from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">{t('price')}</span>
                    <span className="text-neutral-500 dark:text-slate-400">{t('perMonth')}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-8">
                <ul className="space-y-3 mb-8">
                  {features.map((label) => (
                    <li key={label} className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 mt-0.5 shrink-0">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-neutral-600 dark:text-slate-300">{label}</span>
                    </li>
                  ))}
                </ul>

                {error && (
                  <ErrorCallout
                    error={error}
                    onRetry={isSignedIn && !isSubscribed ? handleSubscribe : isSubscribed ? handleManageSubscription : undefined}
                  />
                )}

                {!isSignedIn ? (
                  <>
                    <SignInButton mode="modal">
                      <Button variant="primary" size="lg" fullWidth>
                        {t('signInToSubscribe')}
                      </Button>
                    </SignInButton>
                    <p className="text-center text-sm text-neutral-500 dark:text-slate-400 mt-4">
                      <Link href="/about" className="text-violet-600 dark:text-violet-400 hover:underline">
                        {t('learnMore')}
                      </Link>
                    </p>
                  </>
                ) : isSubscribed ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
                      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                        {isAdmin(userData?.role) ? t('adminAccess') : t('youreSubscribed')}
                      </p>
                    </div>
                    {!isAdmin(userData?.role) && (
                      <Button
                        onClick={handleManageSubscription}
                        loading={loading}
                        variant="secondary"
                        size="lg"
                        fullWidth
                      >
                        {loading ? t('loading') : t('manageSubscription')}
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={handleSubscribe}
                      loading={loading}
                      variant="primary"
                      size="lg"
                      fullWidth
                    >
                      {loading ? t('loading') : t('subscribeNow')}
                    </Button>
                    <p className="text-center text-sm text-neutral-500 dark:text-slate-400 mt-4">
                      <Link href="/about" className="text-violet-600 dark:text-violet-400 hover:underline">
                        {t('learnMore')}
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-neutral-500 dark:text-slate-400 mt-6 inline-flex items-center justify-center gap-1.5 w-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t('securePayment')}
          </p>
        </div>
      </div>
    </main>
  )
}
