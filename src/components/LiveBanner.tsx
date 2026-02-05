'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LiveBanner({ channel }: { channel: string }) {
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    async function checkLiveStatus() {
      try {
        const response = await fetch(`/api/twitch/live?channel=${channel}`)
        const data = await response.json()
        if (response.ok && !data.error) {
          setIsLive(data.isLive)
        }
      } catch {
        // Silently fail - don't show banner if we can't check
      }
    }

    checkLiveStatus()
    const interval = setInterval(checkLiveStatus, 60000)
    return () => clearInterval(interval)
  }, [channel])

  if (!isLive) return null

  return (
    <Link
      href="/live"
      className="block mt-12 p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-colors"
    >
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-600 dark:text-red-400 font-semibold">Live Now</span>
        </span>
        <span className="text-neutral-600 dark:text-slate-300">
          Grant is streaming on Twitch
        </span>
        <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-red-500 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </Link>
  )
}
