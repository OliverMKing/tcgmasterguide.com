'use client'

import { useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { LocaleSwitcher } from './LocaleSwitcher'
import { Link } from '@/i18n/navigation'
import { deckDates } from '@/generated/deck-dates'
import { LogoMark } from './Logo'

const socialClass =
  'flex items-center justify-center w-10 h-10 rounded-[10px] text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors duration-200'

export default function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
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

  const links: { href: '/#decks' | '/posts' | '/qa' | '/about' | '/subscribe'; key: 'decks' | 'posts' | 'qa' | 'about' | 'subscribe' }[] = [
    { href: '/#decks', key: 'decks' },
    { href: '/posts', key: 'posts' },
    { href: '/qa', key: 'qa' },
    { href: '/about', key: 'about' },
    { href: '/subscribe', key: 'subscribe' },
  ]

  return (
    <footer className="border-t border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_auto] md:items-start">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <LogoMark className="w-8 h-8" />
              <span className="font-display font-black text-[1.7rem] leading-none text-ink">TCG Master Guide</span>
            </Link>
            <p className="mt-3 text-ink-2">{t('tagline')}</p>
            {formattedLastUpdated && (
              <p className="mt-1 text-sm text-ink-3">
                {t('lastUpdated')} {formattedLastUpdated}
              </p>
            )}
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {links.map(({ href, key }) => (
                <li key={key}>
                  <Link href={href} className="text-ink-2 hover:text-ink font-semibold">
                    {tNav(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div role="group" className="flex items-center gap-1 -ml-2 md:ml-0" aria-label="Social links">
            <a href="mailto:grantm1999@hotmail.com" className={socialClass} aria-label={t('email')}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <a href="https://x.com/Tricroar" target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="X (Twitter)">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://twitch.tv/tricroar" target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="Twitch">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <LocaleSwitcher />
          <div className="flex items-center gap-4 text-sm text-ink-3">
            <Link href="/privacy" className="hover:text-ink underline-offset-4 hover:underline">
              {t('privacy')}
            </Link>
            <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
