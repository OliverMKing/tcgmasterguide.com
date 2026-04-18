'use client'

import { useState } from 'react'

interface DeckListProps {
  decklist: string
}

export function DeckList({ decklist }: DeckListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

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
    <div className="my-6 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/70 hover:from-violet-50 hover:to-white dark:hover:from-slate-700/70 dark:hover:to-slate-800 transition-colors text-left cursor-pointer"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">Decklist</span>
        </div>
        <svg
          className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ease-snappy ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-snappy ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="relative">
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-1.5 cursor-pointer active:scale-[0.98] ${
              copied
                ? 'bg-emerald-500 hover:bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white'
            }`}
            aria-label={copied ? 'Copied to clipboard' : 'Copy decklist'}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
          <pre className="p-4 pt-12 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
            {decklist}
          </pre>
        </div>
      </div>
    </div>
  )
}
