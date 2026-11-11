'use client'

import { useId, useState } from 'react'
import { useTranslations } from 'next-intl'

interface DeckListProps {
  decklist: string
}

// Sums the card counts at the start of each line ("4 Dreepy TWM 128").
// Section lines such as "Pokémon: 16" have no leading number, so they are skipped.
function countCards(decklist: string): number {
  let total = 0
  for (const line of decklist.split('\n')) {
    const match = /^\s*(\d+)\s+\S/.exec(line)
    if (match) total += Number(match[1])
  }
  return total
}

export function DeckList({ decklist }: DeckListProps) {
  const t = useTranslations('deck')
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const panelId = useId()
  const cardCount = countCards(decklist)
  const sections = decklist.split(/\n\s*\n/)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(decklist)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore clipboard errors (likely permissions)
    }
  }

  return (
    <div className="my-8 rounded-2xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center gap-2 pr-2.5">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="flex-1 min-w-0 flex items-center gap-3 pl-4 pr-2 py-3 text-left cursor-pointer group"
          aria-expanded={isExpanded}
          aria-controls={panelId}
        >
          <svg
            className={`w-4 h-4 shrink-0 text-ink-3 group-hover:text-ink transition-transform duration-300 ease-snappy ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.25}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-display font-extrabold text-2xl leading-none text-ink">{t('decklist')}</span>
          {cardCount > 0 && (
            <span className="text-sm text-ink-3 whitespace-nowrap">{t('cardCount', { count: cardCount })}</span>
          )}
        </button>
        <button
          onClick={handleCopy}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-sm font-semibold transition-colors duration-200 cursor-pointer active:translate-y-px ${
            copied
              ? 'border-ok/40 bg-ok-soft text-ok'
              : 'border-line-strong bg-surface text-ink hover:border-ink'
          }`}
          aria-label={copied ? t('copiedAria') : t('copyDecklist')}
        >
          {copied ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
            </svg>
          )}
          <span aria-live="polite">{copied ? t('copied') : t('copyDecklist')}</span>
        </button>
      </div>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-snappy ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden min-h-0" inert={!isExpanded}>
          <pre className="border-t border-line bg-surface-2 px-4 sm:px-5 py-4 text-[0.875rem] leading-relaxed text-ink-2 font-mono whitespace-pre-wrap break-words sm:columns-2 sm:gap-8">
            {sections.map((section, i) => (
              <span key={i} className="block break-inside-avoid">
                {section}
                {i < sections.length - 1 ? '\n\n' : ''}
              </span>
            ))}
          </pre>
        </div>
      </div>
    </div>
  )
}
