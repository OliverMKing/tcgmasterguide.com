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
      if (!window.location.hash) {
        window.scrollTo(0, 0)
      }
      prevPathname.current = pathname
    }
  }, [pathname])

  return null
}
