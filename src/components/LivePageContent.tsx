'use client'

import { useState, useCallback } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import TwitchEmbed, { type StreamStatus } from '@/components/TwitchEmbed'

interface LivePageContentProps {
  channel: string
}

function StatusLine({ status }: { status: StreamStatus }) {
  const t = useTranslations('live')

  if (status === 'live') {
    return (
      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="flex items-center gap-2 font-bold text-bad">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-bad animate-pulse" />
          {t('live')}
        </span>
        <span className="text-ink-2">{t('streamingNow')}</span>
      </p>
    )
  }

  if (status === 'offline') {
    return (
      <p className="flex items-center gap-2 font-semibold text-ink-2">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-line-strong" />
        {t('offline')}
      </p>
    )
  }

  return <p className="text-ink-2">{status === 'loading' ? t('checkingStatus') : t('checkIfLive')}</p>
}

export default function LivePageContent({ channel }: LivePageContentProps) {
  const t = useTranslations('live')
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('loading')

  const handleStatusChange = useCallback((status: StreamStatus) => {
    setStreamStatus(status)
  }, [])

  const isLive = streamStatus === 'live' || streamStatus === 'unknown'

  return (
    <>
      <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-6 sm:pb-8">
        <h1 className="font-display font-black text-ink text-6xl sm:text-7xl leading-[0.85]">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-ink-2 max-w-[40rem]">{t('subtitle')}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-4">
          <div aria-live="polite">
            <StatusLine status={streamStatus} />
          </div>
          {isLive && (
            <a
              href={`https://twitch.tv/${channel}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-accent-text underline underline-offset-4 decoration-1 hover:decoration-2"
            >
              {t('openInTwitch')}
            </a>
          )}
        </div>
      </header>

      {/* The stream on a playmat: the one bold element on this page */}
      <section className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="playmat rounded-[28px] p-2.5 sm:p-5">
          <TwitchEmbed channel={channel} onStatusChange={handleStatusChange} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 sm:pb-24">
        <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div className="max-w-[40rem]">
            <h2 className="font-display font-extrabold text-3xl text-ink">
              {isLive ? t('ctaTitleLive') : t('ctaTitleOffline')}
            </h2>
            <p className="mt-2 text-ink-2">
              {isLive ? t('ctaDescLive') : t('ctaDescOffline')}
            </p>
          </div>
          <Link
            href="/#decks"
            className="inline-flex shrink-0 items-center self-start rounded-[10px] border border-line-strong px-5 py-3 font-semibold text-ink transition-colors hover:border-ink sm:self-auto"
          >
            {t('viewDeckGuides')}
          </Link>
        </div>
      </section>
    </>
  )
}
