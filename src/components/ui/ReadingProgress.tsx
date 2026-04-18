'use client'

import { useEffect, useState } from 'react'

/**
 * Thin violet progress bar fixed to the top of the viewport that fills as the
 * user scrolls the page. Used on long-form pages (deck guides, about, etc.)
 * to give readers a sense of depth without adding visual noise.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const height = document.documentElement.scrollHeight - window.innerHeight
      const pct = height > 0 ? Math.min(100, Math.max(0, (scrollTop / height) * 100)) : 0
      setProgress(pct)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-0.5 z-[60] pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
