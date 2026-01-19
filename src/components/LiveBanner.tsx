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
      className="block mt-12 p-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/25"
    >
      <div className="flex items-center justify-center gap-3">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="text-white font-bold">LIVE NOW</span>
        </span>
        <span className="text-white/90">
          Grant is streaming! Watch live on Twitch
        </span>
        <svg
          className="w-5 h-5 text-white"
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
      </div>
    </Link>
  )
}
