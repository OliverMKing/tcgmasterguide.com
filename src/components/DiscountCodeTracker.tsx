'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const STORAGE_KEY = 'discountcode'
const PARAM_KEY = 'discountcode'

export function getStoredDiscountCode(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export default function DiscountCodeTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const fromUrl = searchParams.get(PARAM_KEY)
    let code: string | null = fromUrl

    if (fromUrl) {
      try {
        window.localStorage.setItem(STORAGE_KEY, fromUrl)
      } catch {
        // ignore storage errors
      }
    } else {
      try {
        code = window.localStorage.getItem(STORAGE_KEY)
      } catch {
        code = null
      }
    }

    if (code && !fromUrl) {
      // Restore the param into the visible URL without triggering a navigation.
      const url = new URL(window.location.href)
      url.searchParams.set(PARAM_KEY, code)
      window.history.replaceState(window.history.state, '', url.toString())
    }
  }, [pathname, searchParams])

  return null
}
