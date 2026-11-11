'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useUser, useAuth, SignInButton } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { hasSubscriberAccess, isAdmin } from '@/lib/user-roles'
import { Button, Skeleton } from '@/components/ui'
import { getStoredDiscountCode } from '@/components/DiscountCodeTracker'
import { MembershipCard } from './MembershipCard'

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

const adviceKey: Record<CheckoutErrorKind, string> = {
  network: 'errorAdvice.network',
  auth: 'errorAdvice.auth',
  'already-subscribed': 'errorAdvice.alreadySubscribed',
  declined: 'errorAdvice.declined',
  unknown: 'errorAdvice.unknown',
}

function ErrorCallout({ error, onRetry }: { error: TypedError; onRetry?: () => void }) {
  const t = useTranslations('subscribe')
  return (
    <div role="alert" className="mb-5 flex items-start gap-3 rounded-[10px] bg-bad-soft p-3.5 text-sm text-bad">
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{error.message}</p>
        <p className="mt-0.5">{t(adviceKey[error.kind])}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 font-semibold underline underline-offset-4 hover:decoration-2 cursor-pointer">
          {t('retry')}
        </button>
      )}
    </div>
  )
}

// Desktop: the card on its mat to the left, the heading and details to the right.
// Mobile: heading, then the card, then the details.
const layout =
  'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-20 grid gap-8 lg:gap-x-16 lg:gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[auto_1fr]'
const headerCol = 'lg:col-start-2 lg:row-start-1 lg:pt-4'
const matCol = 'lg:col-start-1 lg:row-start-1 lg:row-span-2'
const detailCol = 'lg:col-start-2 lg:row-start-2'
const matClass = 'playmat rounded-[28px] flex items-center justify-center px-6 py-10 sm:py-14 lg:py-20'
const cardSize = 'w-[240px] sm:w-[290px] lg:w-[320px]'

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
        body: JSON.stringify({ locale, discountCode: getStoredDiscountCode() }),
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
      <main className="min-h-screen">
        <div className={layout}>
          <div className={headerCol}>
            <Skeleton className="h-14 w-56 sm:h-20 sm:w-72" rounded="lg" />
            <Skeleton className="mt-5 h-5 w-full max-w-sm" />
          </div>
          <div className={matCol}>
            <div className={matClass}>
              <div className={`mat-slot ${cardSize}`} />
            </div>
          </div>
          <div className={detailCol} aria-hidden="true">
            <Skeleton className="h-7 w-40" />
            <div className="mt-5 space-y-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-5 w-full max-w-md" />
              ))}
            </div>
            <Skeleton className="mt-8 h-12 w-full sm:w-52" rounded="lg" />
          </div>
        </div>
      </main>
    )
  }

  const features = [t('feature1'), t('feature2'), t('feature3'), t('feature4'), t('feature5'), t('feature6'), t('feature7')]

  const learnMore = (
    <Link href="/about" className="font-semibold text-accent-text underline underline-offset-4 decoration-1 hover:decoration-2">
      {t('learnMore')}
    </Link>
  )

  return (
    <main className="min-h-screen">
      <div className={layout}>
        <header className={headerCol}>
          <h1 className="font-display font-black text-ink text-[clamp(3.25rem,8vw,5.5rem)] leading-[0.85] tracking-[-0.01em]">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-ink-2 max-w-[34rem]">{t('subtitle')}</p>
        </header>

        {/* The membership, as a holo card on a small playmat */}
        <div className={matCol}>
          <div className={matClass}>
            {/* Laid on the mat at a slight angle, like a card put down by hand */}
            <div className="-rotate-2">
              <MembershipCard className={cardSize} />
            </div>
          </div>
        </div>

        <section className={detailCol} aria-labelledby="features-title">
          <h2 id="features-title" className="font-display font-extrabold text-ink text-3xl">
            {t('featuresTitle')}
          </h2>
          <p className="sr-only">
            {t('monthlyAccess')}: {t('price')} {t('perMonth')}
          </p>
          <ul className="mt-4 max-w-[34rem] border-t border-line">
            {features.map((label) => (
              <li key={label} className="border-b border-line py-3 text-ink-2">
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 max-w-[34rem]">
            {error && (
              <ErrorCallout
                error={error}
                onRetry={isSignedIn && !isSubscribed ? handleSubscribe : isSubscribed ? handleManageSubscription : undefined}
              />
            )}

            {!isSignedIn ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <SignInButton mode="modal">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    {t('signInToSubscribe')}
                  </Button>
                </SignInButton>
                {learnMore}
              </div>
            ) : isSubscribed ? (
              <div className="space-y-4">
                <p className="flex items-center gap-2.5 rounded-[10px] bg-ok-soft text-ok font-semibold px-4 py-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isAdmin(userData?.role) ? t('adminAccess') : t('youreSubscribed')}
                </p>
                {!isAdmin(userData?.role) && (
                  <Button
                    onClick={handleManageSubscription}
                    loading={loading}
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {loading ? t('loading') : t('manageSubscription')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <Button
                  onClick={handleSubscribe}
                  loading={loading}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {loading ? t('loading') : t('subscribeNow')}
                </Button>
                {learnMore}
              </div>
            )}

            <p className="mt-6 flex items-center gap-2 text-sm text-ink-3">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {t('securePayment')}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
