'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { HistoryEntry, HistoryChange } from '@/generated/deck-history'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  history: HistoryEntry[]
  deckTitle: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function ChangeItem({ change }: { change: HistoryChange }) {
  const isAdd = change.type === 'add'
  return (
    <div
      className={`font-mono text-sm px-3 py-1 rounded ${
        isAdd
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      }`}
    >
      <span className="select-none mr-2">{isAdd ? '+' : '-'}</span>
      <span className="whitespace-pre-wrap break-words">{change.content}</span>
    </div>
  )
}

function groupChangesByHeading(changes: HistoryChange[]): Map<string | null, HistoryChange[]> {
  const groups = new Map<string | null, HistoryChange[]>()
  for (const change of changes) {
    const heading = change.heading
    if (!groups.has(heading)) {
      groups.set(heading, [])
    }
    groups.get(heading)!.push(change)
  }
  return groups
}

export function HistoryModal({ isOpen, onClose, history, deckTitle }: HistoryModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const detailsRef = useRef<HTMLDivElement>(null)

  const handleSelectRevision = (index: number) => {
    setSelectedIndex(index)
    detailsRef.current?.scrollTo({ top: 0 })
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const selectedEntry = history[selectedIndex]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              Revision History
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {deckTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile: Horizontal revision selector */}
        <div className="md:hidden border-b border-slate-200 dark:border-slate-700 p-3">
          <div className="flex gap-2">
            {history.map((entry, index) => (
              <button
                key={entry.hash}
                onClick={() => handleSelectRevision(index)}
                className={`flex-1 px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  selectedIndex === index
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <span>Rev {history.length - index}</span>
                    {index === 0 && (
                      <span className="text-[10px] text-green-600 dark:text-green-400">✓</span>
                    )}
                  </div>
                  <span className="text-[11px] opacity-75">{formatDateShort(entry.date)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop: Version list sidebar */}
          <div className="hidden md:block w-64 border-r border-slate-200 dark:border-slate-700 overflow-y-auto flex-shrink-0">
            {history.map((entry, index) => (
              <button
                key={entry.hash}
                onClick={() => handleSelectRevision(index)}
                className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700 transition-colors cursor-pointer ${
                  selectedIndex === index
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Revision {history.length - index}
                  </span>
                  {index === 0 && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {formatDate(entry.date)}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-green-600 dark:text-green-400">
                    +{entry.additions}
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    -{entry.deletions}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Change details */}
          <div ref={detailsRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
            {selectedEntry && (
              <>
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Revision {history.length - selectedIndex}
                    {selectedIndex === 0 && <span className="text-green-600 dark:text-green-400 text-sm font-normal ml-2">(Current)</span>}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {formatDate(selectedEntry.date)} • {selectedEntry.additions} additions, {selectedEntry.deletions} deletions
                  </p>
                </div>

                {selectedEntry.changes.length > 0 ? (
                  <div className="space-y-4">
                    {Array.from(groupChangesByHeading(selectedEntry.changes)).map(([heading, changes]) => (
                      <div key={heading ?? 'no-heading'}>
                        {heading && (
                          <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 pb-1 border-b border-slate-200 dark:border-slate-600">
                            {heading}
                          </h4>
                        )}
                        <div className="space-y-1">
                          {changes.map((change, i) => (
                            <ChangeItem key={`${change.type}-${change.lineNumber}-${i}`} change={change} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 text-slate-500 dark:text-slate-400">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No content changes in this revision</p>
                    <p className="text-sm mt-1">(Metadata-only update)</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
