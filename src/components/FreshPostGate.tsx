'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { isPostFresh } from '@/lib/postFreshness'

// The home page is statically generated, so the build-time freshness check can go
// out of date. This re-checks in the browser and hides the content once it expires.
export function FreshPostGate({ date, children }: { date: string; children: ReactNode }) {
  const [fresh, setFresh] = useState(true)

  useEffect(() => {
    setFresh(isPostFresh(date))
  }, [date])

  return fresh ? <>{children}</> : null
}
