'use client'

import { useCallback, type ReactNode } from 'react'

interface BrowseDecksButtonProps {
  children: ReactNode
}

export function BrowseDecksButton({ children }: BrowseDecksButtonProps) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const element = document.getElementById('decks')
    if (!element) return
    e.preventDefault()
    const navbarHeight = 64
    const top = element.getBoundingClientRect().top + window.scrollY - navbarHeight
    window.scrollTo({ top, behavior: 'smooth' })
    window.history.pushState(null, '', '/#decks')
  }, [])

  return (
    <a
      href="#decks"
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium px-6 py-3 rounded-xl transition-colors duration-200 ease-snappy active:scale-[0.98]"
    >
      {children}
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </a>
  )
}
