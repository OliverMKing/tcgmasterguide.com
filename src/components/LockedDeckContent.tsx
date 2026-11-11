'use client'

import { useId } from 'react'
import { useTranslations } from 'next-intl'
import { FaceDownCards, LockedActions } from '@/components/LockedSection'

interface TocItem {
  id: string
  text: string
  level: number
}

interface LockedDeckContentProps {
  title: string
  headings: TocItem[]
  /** "post" swaps the copy for blog posts. */
  kind?: 'guide' | 'post'
}

export function LockedDeckContent({ headings, kind = 'guide' }: LockedDeckContentProps) {
  const t = useTranslations('locked')
  const titleId = useId()
  const previewHeadings = headings.slice(0, 5)
  const minLevel = previewHeadings.length > 0 ? Math.min(...previewHeadings.map((h) => h.level)) : 1

  return (
    <div>
      <section aria-labelledby={titleId} className="rounded-2xl border border-line bg-surface p-5 sm:p-8">
        <FaceDownCards className="-ml-2" />
        <h2 id={titleId} className="mt-5 font-display font-black text-[2.25rem] sm:text-5xl leading-[0.9] text-ink">
          {t(kind === 'post' ? 'postFaceDownTitle' : 'guideFaceDownTitle')}
        </h2>
        <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-ink-2">{t(kind === 'post' ? 'postFaceDownBody' : 'guideFaceDownBody')}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
          <LockedActions />
          <span className="text-sm text-ink-3">{t('cancelAnytime')}</span>
        </div>
      </section>

      {previewHeadings.length > 0 && (
        <div className="mt-12">
          <h3 className="font-display font-extrabold text-[1.75rem] leading-none text-ink">{t('whatsInside')}</h3>
          <ul className="mt-4 border-t border-line">
            {previewHeadings.map((heading) => (
              <li
                key={heading.id}
                className="flex items-center gap-3 border-b border-line py-3 text-ink-2"
                style={{ paddingLeft: `${(heading.level - minLevel) * 1.25}rem` }}
              >
                <svg className="w-4 h-4 shrink-0 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path strokeLinecap="round" d="M8 11V8a4 4 0 018 0v3" />
                </svg>
                <span className="min-w-0">{heading.text}</span>
              </li>
            ))}
          </ul>
          {headings.length > previewHeadings.length && (
            <p className="mt-3 text-sm text-ink-3">
              {t('moreSections', { count: headings.length - previewHeadings.length })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
