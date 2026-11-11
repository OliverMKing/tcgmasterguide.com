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
      className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-accent text-accent-ink hover:bg-accent-hover font-semibold px-5 py-3 transition-colors active:translate-y-px"
    >
      {children}
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </a>
  )
}
