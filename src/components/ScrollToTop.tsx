'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollToTop() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    // Only scroll to top if the pathname changed (not just the hash)
    if (prevPathname.current !== pathname) {
      // Check if the current URL has a hash (anchor)
      if (window.location.hash) {
        // Scroll to the anchor element after a brief delay to let the page render
        const id = decodeURIComponent(window.location.hash.slice(1))
        const scrollToAnchor = () => document.getElementById(id)?.scrollIntoView({ behavior: 'auto' })
        setTimeout(scrollToAnchor, 100)
        // Content that loads later (such as the announcement banner) can push the
        // anchor down, so check again once the page has settled.
        setTimeout(() => {
          const element = document.getElementById(id)
          if (!element) return
          const offset = parseFloat(getComputedStyle(element).scrollMarginTop) || 0
          if (Math.abs(element.getBoundingClientRect().top - offset) > 2) scrollToAnchor()
        }, 500)
      } else {
        window.scrollTo(0, 0)
      }
      prevPathname.current = pathname
    }
  }, [pathname])

  return null
}
