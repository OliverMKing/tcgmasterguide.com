'use client'

import { useEffect, useState, useRef } from 'react'

interface TwitchEmbedProps {
  channel: string
}

type StreamStatus = 'loading' | 'live' | 'offline' | 'unknown'

export default function TwitchEmbed({ channel }: TwitchEmbedProps) {
  const [status, setStatus] = useState<StreamStatus>('loading')
  const [isMobile, setIsMobile] = useState(false)
  const embedRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<unknown>(null)

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
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Checking stream status...</p>
        </div>
      </div>
    )
  }

  if (status === 'offline') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Stream Offline
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md">
            Grant is not currently streaming. Follow on Twitch to get notified when they go live!
          </p>
          <a
            href={`https://twitch.tv/${channel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
            </svg>
            Follow on Twitch
          </a>
        </div>
      </div>
    )
  }

  // Live or unknown status - show embed
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          {status === 'live' ? (
            <>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-red-500">LIVE</span>
              </span>
              <span className="text-slate-600 dark:text-slate-300 text-sm hidden sm:inline">
                Grant is streaming now!
              </span>
            </>
          ) : (
            <span className="text-slate-600 dark:text-slate-300 text-sm">
              Check if Grant is live on Twitch
            </span>
          )}
        </div>
        <a
          href={`https://twitch.tv/${channel}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          Open in Twitch
        </a>
      </div>
      {/* Video player */}
      <div
        ref={embedRef}
        className={isMobile ? 'hidden' : 'h-[500px]'}
      />
      {/* Mobile: stacked video + chat */}
      {isMobile && (
        <div className="flex flex-col">
          <iframe
            src={`https://player.twitch.tv/?channel=${channel}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`}
            className="w-full h-[56.25vw] max-h-[300px]"
            allowFullScreen
          />
          <iframe
            src={`https://www.twitch.tv/embed/${channel}/chat?parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`}
            className="w-full h-[400px]"
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
