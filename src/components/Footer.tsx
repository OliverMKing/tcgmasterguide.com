'use client'

import { useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { LocaleSwitcher } from './LocaleSwitcher'
import { deckDates } from '@/generated/deck-dates'

export default function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()

  const mostRecentUpdate = useMemo(() => {
    const dates = Object.values(deckDates)
      .map((d) => new Date(d).getTime())
      .filter((t) => Number.isFinite(t))
    if (dates.length === 0) return null
    return new Date(Math.max(...dates))
  }, [])

  const formattedLastUpdated = mostRecentUpdate
    ? mostRecentUpdate.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-stone-200 dark:border-slate-700 relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-purple-500/5" aria-hidden="true" />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" aria-hidden="true" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              TCG Master Guide
            </span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              {t('tagline')}
            </p>
            {formattedLastUpdated && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {t('lastUpdated')} {formattedLastUpdated}
              </p>
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2" role="list" aria-label="Social links">
            <a
              href="mailto:grantm1999@hotmail.com"
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 dark:bg-slate-800 text-neutral-500 dark:text-neutral-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 ease-snappy hover:-translate-y-0.5"
              aria-label={t('email')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <a
              href="https://x.com/Tricroar"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 dark:bg-slate-800 text-neutral-500 dark:text-neutral-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 ease-snappy hover:-translate-y-0.5"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://twitch.tv/tricroar"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 dark:bg-slate-800 text-neutral-500 dark:text-neutral-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 ease-snappy hover:-translate-y-0.5"
              aria-label="Twitch"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <LocaleSwitcher />
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {new Date().getFullYear()} tcgmasterguide.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
