'use client'

import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from './LocaleSwitcher'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-stone-200 dark:border-slate-700 relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-purple-500/5" />

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
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            <a
              href="mailto:grantm1999@hotmail.com"
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 dark:bg-slate-700 text-neutral-500 dark:text-neutral-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300"
              aria-label="Email"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <a
              href="https://x.com/Tricroar"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 dark:bg-slate-700 text-neutral-500 dark:text-neutral-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://twitch.tv/tricroar"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 dark:bg-slate-700 text-neutral-500 dark:text-neutral-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300"
              aria-label="Twitch"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
