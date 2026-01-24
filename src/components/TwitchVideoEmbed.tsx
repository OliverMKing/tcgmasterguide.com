'use client'

import { useEffect, useRef, useState } from 'react'

interface TwitchVideoEmbedProps {
  videoId: string
  title?: string
}

export function TwitchVideoEmbed({ videoId, title = 'Twitch video' }: TwitchVideoEmbedProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [parent, setParent] = useState('localhost')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setParent(window.location.hostname)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="my-6 aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-slate-100 dark:bg-slate-800"
    >
      {isVisible ? (
        <iframe
          src={`https://player.twitch.tv/?video=${videoId}&parent=${parent}&autoplay=false`}
          title={title}
          allowFullScreen
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-slate-400 dark:text-slate-500">Loading video...</div>
        </div>
      )}
    </div>
  )
}
