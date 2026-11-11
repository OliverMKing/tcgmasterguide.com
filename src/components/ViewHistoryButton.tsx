'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { HistoryModal } from './HistoryModal'
import { HistoryEntry } from '@/generated/deck-history'

interface ViewHistoryButtonProps {
  history: HistoryEntry[]
  deckTitle: string
  /** "mat" for use on the playmat header, "page" for use on the page. */
  tone?: 'page' | 'mat'
}

export function ViewHistoryButton({ history, deckTitle, tone = 'page' }: ViewHistoryButtonProps) {
  const t = useTranslations('deck')
  const [isOpen, setIsOpen] = useState(false)

  if (history.length === 0) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2 transition-colors cursor-pointer ${
          tone === 'mat' ? 'text-mat-ink-2 hover:text-mat-ink' : 'text-ink-2 hover:text-ink'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t('viewHistory')}
      </button>
      <HistoryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        history={history}
        deckTitle={deckTitle}
      />
    </>
  )
}
