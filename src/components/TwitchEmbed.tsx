'use client'

import { useEffect, useState, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface TwitchEmbedProps {
  channel: string
  onStatusChange?: (status: StreamStatus) => void
}

export type { StreamStatus }

type StreamStatus = 'loading' | 'live' | 'offline' | 'unknown'

const twitchGlyph =
  'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z'

// The embed sits on a playmat. Desktop shows the video at 16:9 with the
// Twitch chat column (340px) beside it; mobile stacks video and chat.
export default function TwitchEmbed({ channel, onStatusChange }: TwitchEmbedProps) {
  const t = useTranslations('live')
  const [status, setStatus] = useState<StreamStatus>('loading')
  const [isMobile, setIsMobile] = useState(false)
  const embedRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<unknown>(null)

  // Notify parent of status changes
  useEffect(() => {
    onStatusChange?.(status)
  }, [status, onStatusChange])

  // Check screen size for layout
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check if the stream is live via our API route
  useEffect(() => {
    async function checkLiveStatus() {
      try {
        const response = await fetch(`/api/twitch/live?channel=${channel}`)
        const data = await response.json()

        if (!response.ok || data.error) {
          // API error (429, misconfigured, etc.) - show embed anyway
          console.warn('Twitch API error:', data.error || response.status)
          setStatus('unknown')
          return
        }

        setStatus(data.isLive ? 'live' : 'offline')
      } catch (err) {
        console.error('Error checking live status:', err)
        // Network error - show embed anyway
        setStatus('unknown')
      }
    }

    checkLiveStatus()
    // Poll every 60 seconds
    const interval = setInterval(checkLiveStatus, 60000)
    return () => clearInterval(interval)
  }, [channel])

  // Load Twitch embed when live or unknown
  const shouldShowEmbed = status === 'live' || status === 'unknown'

  useEffect(() => {
    if (!shouldShowEmbed || !embedRef.current) return

    // Clear previous embed if exists
    if (playerRef.current) {
      embedRef.current.innerHTML = ''
      playerRef.current = null
    }

    // Load Twitch embed script
    const script = document.createElement('script')
    script.src = 'https://embed.twitch.tv/embed/v1.js'
    script.async = true
    script.onload = () => {
      if (embedRef.current && window.Twitch) {
        playerRef.current = new window.Twitch.Embed(embedRef.current, {
          channel,
          width: '100%',
          height: '100%',
          layout: isMobile ? 'video' : 'video-with-chat',
          parent: [window.location.hostname],
        })
      }
    }
    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [shouldShowEmbed, channel, isMobile])

  if (status === 'loading') {
    return (
      <div className="mat-zone flex aspect-video items-center justify-center p-6">
        <div role="status" className="flex items-center gap-3 text-mat-ink-2">
          <span
            aria-hidden="true"
            className="size-5 rounded-full border-2 border-mat-line border-t-mat-ink animate-spin"
          />
          <span>{t('checkingStatus')}</span>
        </div>
      </div>
    )
  }

  if (status === 'offline') {
    return (
      <div className="mat-zone flex min-h-[320px] items-end p-6 sm:aspect-video sm:p-10 lg:aspect-[21/9]">
        <div className="max-w-[34rem]">
          <svg className="size-10 text-mat-ink-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d={twitchGlyph} />
          </svg>
          <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl leading-none text-mat-ink">
            {t('streamOffline')}
          </h2>
          <p className="mt-3 text-mat-ink-2 sm:text-lg">{t('offlineMessage')}</p>
          <a
            href={`https://twitch.tv/${channel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-accent px-5 py-3 font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d={twitchGlyph} />
            </svg>
            {t('followOnTwitch')}
          </a>
        </div>
      </div>
    )
  }

  // Live or unknown status - show embed
  const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  return (
    <div className="@container overflow-hidden rounded-[18px] bg-black">
      {/* Video player with chat (desktop). Height keeps the video at 16:9 beside the 340px chat. */}
      <div
        ref={embedRef}
        className={isMobile ? 'hidden' : 'h-[max(420px,calc((100cqw-340px)*0.5625))]'}
      />
      {/* Mobile: stacked video + chat */}
      {isMobile && (
        <div className="flex flex-col">
          <iframe
            title={t('title')}
            src={`https://player.twitch.tv/?channel=${channel}&parent=${parent}`}
            className="block w-full aspect-video"
            allowFullScreen
          />
          <iframe
            title="Twitch chat"
            src={`https://www.twitch.tv/embed/${channel}/chat?parent=${parent}`}
            className="block w-full h-[420px]"
          />
        </div>
      )}
    </div>
  )
}

// Extend Window interface for Twitch
declare global {
  interface Window {
    Twitch?: {
      Embed: new (element: HTMLElement, options: {
        channel: string
        width: string
        height: string
        layout: string
        parent: string[]
      }) => unknown
    }
  }
}
