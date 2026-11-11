'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations, useLocale } from 'next-intl'
import { HistoryEntry, HistoryChange } from '@/generated/deck-history'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  history: HistoryEntry[]
  deckTitle: string
}

function useFormatDate() {
  const locale = useLocale()
  const dateLocale = locale === 'es' ? 'es-ES' : 'en-US'

  return {
    formatDate: (dateString: string): string => {
      const date = new Date(dateString)
      return date.toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    formatDateShort: (dateString: string): string => {
      const date = new Date(dateString)
      return date.toLocaleDateString(dateLocale, {
        month: 'short',
        day: 'numeric',
      })
    }
  }
}

function ChangeItem({ change }: { change: HistoryChange }) {
  const isAdd = change.type === 'add'
  return (
    <div
      className={`font-mono text-sm px-3 py-1 rounded-md ${
        isAdd
          ? 'bg-ok-soft text-ok'
          : 'bg-bad-soft text-bad'
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
  const t = useTranslations('deck')
  const { formatDate, formatDateShort } = useFormatDate()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const detailsRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const handleSelectRevision = (index: number) => {
    setSelectedIndex(index)
    detailsRef.current?.scrollTo({ top: 0 })
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    // Keep keyboard focus inside the dialog while it is open.
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    // Move focus into the dialog, and give it back to the trigger when the dialog closes.
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus?.()
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const selectedEntry = history[selectedIndex]

  // Render into <body> so the modal is not trapped in the stacking context of the
  // playmat header (which uses isolation: isolate) and sits above the sticky navbar.
  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0d0816]/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-surface border border-line-strong rounded-2xl w-full max-w-4xl max-h-[85dvh] sm:max-h-[85vh] flex flex-col overflow-hidden"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('revisionHistory')}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-4 sm:px-6 sm:py-5 border-b border-line">
          <div>
            <h2 className="font-display font-black text-3xl leading-none text-ink">
              {t('revisionHistory')}
            </h2>
            <p className="text-sm text-ink-3 mt-1.5">
              {deckTitle}
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="-mr-2 p-2 text-ink-3 hover:text-ink hover:bg-surface-2 rounded-[10px] transition-colors cursor-pointer"
            aria-label={t('close')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile: Horizontal revision selector */}
        <div className="md:hidden border-b border-line p-3">
          <div className="flex gap-2 overflow-x-auto">
            {history.map((entry, index) => (
              <button
                key={entry.hash}
                onClick={() => handleSelectRevision(index)}
                className={`flex-1 min-w-[4.5rem] px-2 py-2 rounded-[10px] border text-sm transition-colors cursor-pointer ${
                  selectedIndex === index
                    ? 'border-accent bg-accent-soft text-accent-text font-semibold'
                    : 'border-line bg-surface text-ink-2 hover:border-line-strong'
                }`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <span>{t('rev')} {history.length - index}</span>
                    {index === 0 && (
                      <span className="text-[10px] text-ok" aria-label={t('current')}>✓</span>
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
          <div className="hidden md:block w-64 border-r border-line overflow-y-auto flex-shrink-0">
            {history.map((entry, index) => (
              <button
                key={entry.hash}
                onClick={() => handleSelectRevision(index)}
                className={`w-full text-left px-4 py-3.5 border-b border-line border-l-2 transition-colors cursor-pointer ${
                  selectedIndex === index
                    ? 'bg-surface-2 border-l-accent'
                    : 'hover:bg-surface-2 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-ink">
                    {t('revision')} {history.length - index}
                  </span>
                  {index === 0 && (
                    <span className="text-xs font-semibold bg-ok-soft text-ok px-2 py-0.5 rounded-full">
                      {t('current')}
                    </span>
                  )}
                </div>
                <div className="text-sm text-ink-2">
                  {formatDate(entry.date)}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-ok font-semibold">
                    +{entry.additions}
                  </span>
                  <span className="text-bad font-semibold">
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
                  <h3 className="font-display font-extrabold text-2xl leading-none text-ink">
                    {t('revision')} {history.length - selectedIndex}
                    {selectedIndex === 0 && (
                      <span className="ml-2 align-middle font-sans text-xs font-semibold bg-ok-soft text-ok px-2 py-0.5 rounded-full">
                        {t('current')}
                      </span>
                    )}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-3">
                    <span>{formatDate(selectedEntry.date)}</span>
                    <span>
                      <span className="text-ok font-semibold">{selectedEntry.additions}</span> {t('additions')}
                    </span>
                    <span>
                      <span className="text-bad font-semibold">{selectedEntry.deletions}</span> {t('deletions')}
                    </span>
                  </div>
                </div>

                {selectedEntry.changes.length > 0 ? (
                  <div className="space-y-4">
                    {Array.from(groupChangesByHeading(selectedEntry.changes)).map(([heading, changes]) => (
                      <div key={heading ?? 'no-heading'}>
                        {heading && (
                          <h4 className="font-sans text-sm font-semibold text-ink-2 mb-2 pb-1.5 border-b border-line">
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
                  <div className="py-8 sm:py-12 text-ink-3">
                    <svg className="w-10 h-10 mb-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-ink-2">{t('noChanges')}</p>
                    <p className="text-sm mt-1">{t('metadataOnly')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
