'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { clearUserCache, useCurrentUser } from '@/hooks/useCurrentUser'
import { LogoMark } from '@/components/Logo'
import { MembershipCard } from '../MembershipCard'

const MAX_POLL_ATTEMPTS = 10
const POLL_INTERVAL = 1500 // 1.5 seconds

export default function SubscribeSuccessPage() {
  const t = useTranslations('subscribe.success')
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
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* While we wait, the card lies face down. When the payment is confirmed, it turns over. */}
        <div className="[perspective:1200px] text-left" aria-hidden="true">
          <div
            className={`relative w-[210px] sm:w-[240px] [transform-style:preserve-3d] transition-transform duration-[900ms] ease-snappy ${
              isWaiting ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
            }`}
          >
            <MembershipCard className="w-full [backface-visibility:hidden]" />
            {/* The card back. The wrapper holds the position, because .tcg-card sets its own. */}
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="tcg-card h-full w-full">
                <div className="relative h-full rounded-[7px] bg-mat flex items-center justify-center">
                  <div className="mat-zone absolute inset-3 rounded-[8px]" />
                  <div className={`rounded-full bg-card-art p-4 ${isWaiting ? 'animate-pulse' : ''}`}>
                    <LogoMark className="w-14 h-14" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div role="status" aria-live="polite" className="mt-10">
          <h1 className="font-display font-black text-ink text-5xl sm:text-6xl leading-[0.9]">
            {isWaiting ? t('activatingTitle') : t('title')}
          </h1>
          <p className="mt-4 text-lg text-ink-2">
            {isWaiting ? t('activatingMessage') : t('message')}
          </p>
        </div>

        {!isWaiting && (
          <Link
            href="/#decks"
            className="mt-8 inline-flex items-center rounded-[10px] bg-accent text-accent-ink hover:bg-accent-hover font-semibold px-6 py-3 transition-colors"
          >
            {t('browse')}
          </Link>
        )}
      </div>
    </main>
  )
}
