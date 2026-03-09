'use client'

import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface Announcement {
  type: string
  message: string
}

export default function AnnouncementBanner() {
  const { isLoaded, isSignedIn, hasSubscriberAccess } = useCurrentUser()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch('/api/announcements')
        if (res.ok) {
          const data = await res.json()
          setAnnouncements(data.announcements)
        }
      } catch {
        // Silently fail - announcements are non-critical
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  if (loading || announcements.length === 0) return null

  const publicAnnouncement = announcements.find((a) => a.type === 'PUBLIC')
  const subscriberAnnouncement = announcements.find((a) => a.type === 'SUBSCRIBER')

  const showPublic = publicAnnouncement && !dismissed.has('PUBLIC')
  const showSubscriber =
    subscriberAnnouncement &&
    !dismissed.has('SUBSCRIBER') &&
    isLoaded &&
    isSignedIn &&
    hasSubscriberAccess

  if (!showPublic && !showSubscriber) return null

  return (
    <div className="w-full">
      {showPublic && (
        <div className="bg-violet-50/80 dark:bg-violet-950/40 border-b border-violet-200/60 dark:border-violet-800/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-violet-200 dark:bg-violet-800/60">
                  <svg
                    className="w-3 h-3 text-violet-600 dark:text-violet-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </span>
                <p className="text-sm text-neutral-700 dark:text-slate-300 break-words whitespace-pre-line">
                  {publicAnnouncement.message}
                </p>
              </div>
              <button
                onClick={() => setDismissed((prev) => new Set([...prev, 'PUBLIC']))}
                className="shrink-0 p-1 rounded-full text-neutral-400 dark:text-slate-500 hover:text-neutral-600 dark:hover:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors cursor-pointer"
                aria-label="Dismiss announcement"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      {showSubscriber && (
        <div className="bg-purple-50/80 dark:bg-purple-950/30 border-b border-purple-200/60 dark:border-purple-800/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-purple-200 dark:bg-purple-800/60">
                  <svg
                    className="w-3 h-3 text-purple-600 dark:text-purple-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </span>
                <p className="text-sm text-neutral-700 dark:text-slate-300 break-words whitespace-pre-line">
                  {subscriberAnnouncement.message}
                </p>
              </div>
              <button
                onClick={() => setDismissed((prev) => new Set([...prev, 'SUBSCRIBER']))}
                className="shrink-0 p-1 rounded-full text-neutral-400 dark:text-slate-500 hover:text-neutral-600 dark:hover:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
                aria-label="Dismiss subscriber announcement"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
