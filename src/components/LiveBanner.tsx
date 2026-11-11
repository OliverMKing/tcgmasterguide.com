'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export default function LiveBanner({ channel }: { channel: string }) {
  const t = useTranslations('live')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    async function checkLiveStatus() {
      try {
        const response = await fetch(`/api/twitch/live?channel=${channel}`)
        const data = await response.json()
        if (response.ok && !data.error) {
          setIsLive(data.isLive)
        }
      } catch {
        // Silently fail - don't show banner if we can't check
      }
    }

    checkLiveStatus()
    const interval = setInterval(checkLiveStatus, 60000)
    return () => clearInterval(interval)
  }, [channel])

  if (!isLive) return null

  return (
    <Link
      href="/live"
      className="group mt-4 flex items-center gap-x-4 gap-y-1 rounded-2xl border border-line bg-surface px-4 py-3.5 sm:px-5 transition-colors hover:border-line-strong hover:bg-surface-2"
    >
      <span className="flex shrink-0 items-center gap-2 font-bold text-bad">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-bad animate-pulse" />
        {t('liveNow')}
      </span>
      <span className="min-w-0 flex-1 text-ink-2 group-hover:text-ink transition-colors">
        {t('streaming')}
      </span>
      <svg
        aria-hidden="true"
        className="size-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
