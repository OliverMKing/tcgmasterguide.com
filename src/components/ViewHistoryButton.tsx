'use client'

import { useState } from 'react'
import { HistoryModal } from './HistoryModal'
import { HistoryEntry } from '@/generated/deck-history'

interface ViewHistoryButtonProps {
  history: HistoryEntry[]
  deckTitle: string
}

export function ViewHistoryButton({ history, deckTitle }: ViewHistoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (history.length === 0) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer hover:underline"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        View history
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
