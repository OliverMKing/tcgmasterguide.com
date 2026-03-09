'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface Announcement {
  type: string
  message: string
}

function useIsMultiline() {
  const ref = useRef<HTMLParagraphElement>(null)
  const [isMultiline, setIsMultiline] = useState(false)

  const check = useCallback(() => {
    const el = ref.current
    if (!el) return
    // Compare element height to its line height to detect wrapping
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
    setIsMultiline(el.scrollHeight > lineHeight * 1.5)
  }, [])

  useEffect(() => {
    check()
    const observer = new ResizeObserver(check)
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [check])

  return { ref, isMultiline }
}

function AnnouncementRow({
  message,
  type,
  onDismiss,
  variant,
}: {
  message: string
  type: string
  onDismiss: () => void
  variant: 'violet' | 'purple'
}) {
  const { ref, isMultiline } = useIsMultiline()

  const bgClasses =
    variant === 'violet'
      ? 'bg-violet-50/80 dark:bg-violet-950/40 border-b border-violet-200/60 dark:border-violet-800/40'
      : 'bg-purple-50/80 dark:bg-purple-950/30 border-b border-purple-200/60 dark:border-purple-800/40'

  const iconBgClasses =
    variant === 'violet'
      ? 'bg-violet-200 dark:bg-violet-800/60'
      : 'bg-purple-200 dark:bg-purple-800/60'

  const iconColorClasses =
    variant === 'violet'
      ? 'text-violet-600 dark:text-violet-300'
      : 'text-purple-600 dark:text-purple-300'

  const dismissHoverClasses =
    variant === 'violet'
      ? 'hover:bg-violet-100 dark:hover:bg-violet-900/40'
      : 'hover:bg-purple-100 dark:hover:bg-purple-900/40'

  const iconPath =
    type === 'PUBLIC'
      ? 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
      : 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'

  return (
    <div className={bgClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-2.5">
        <div
          className={`flex gap-2.5 sm:gap-3 ${isMultiline ? 'items-start' : 'items-center'}`}
        >
          <span
            className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full ${iconBgClasses} ${isMultiline ? 'mt-[5px]' : ''}`}
          >
            <svg
              className={`w-3 h-3 ${iconColorClasses}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={iconPath}
              />
            </svg>
          </span>
          <p
            ref={ref}
            className="flex-1 min-w-0 text-sm leading-relaxed text-neutral-700 dark:text-slate-300 break-words whitespace-pre-line"
          >
            {message}
          </p>
          <button
            onClick={onDismiss}
            className={`shrink-0 p-1 rounded-full text-neutral-400 dark:text-slate-500 hover:text-neutral-600 dark:hover:text-slate-300 ${dismissHoverClasses} transition-colors cursor-pointer`}
            aria-label={`Dismiss ${type === 'PUBLIC' ? '' : 'subscriber '}announcement`}
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
  )
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
        <AnnouncementRow
          message={publicAnnouncement.message}
          type="PUBLIC"
          onDismiss={() => setDismissed((prev) => new Set([...prev, 'PUBLIC']))}
          variant="violet"
        />
      )}
      {showSubscriber && (
        <AnnouncementRow
          message={subscriberAnnouncement.message}
          type="SUBSCRIBER"
          onDismiss={() =>
            setDismissed((prev) => new Set([...prev, 'SUBSCRIBER']))
          }
          variant="purple"
        />
      )}
    </div>
  )
}
