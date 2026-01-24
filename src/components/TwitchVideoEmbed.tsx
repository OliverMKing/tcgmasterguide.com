'use client'

import { useEffect, useState } from 'react'
import { useVideoEmbed } from '@/contexts/VideoEmbedContext'

interface TwitchVideoEmbedProps {
  videoId: string
  title?: string
}

export function TwitchVideoEmbed({ videoId, title = 'Twitch video' }: TwitchVideoEmbedProps) {
  const [parent, setParent] = useState('localhost')
  const { activeVideoId, setActiveVideoId } = useVideoEmbed()
  const isActive = activeVideoId === `twitch-${videoId}`

  useEffect(() => {
    setParent(window.location.hostname)
  }, [])

  const handleClick = () => {
    setActiveVideoId(`twitch-${videoId}`)
  }

  return (
    <div className="my-6 aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg relative">
      {isActive ? (
        <iframe
          src={`https://player.twitch.tv/?video=${videoId}&parent=${parent}&autoplay=true`}
          title={title}
          allowFullScreen
          className="w-full h-full"
        />
      ) : (
        <button
          onClick={handleClick}
          className="w-full h-full relative group cursor-pointer bg-slate-800"
          aria-label={`Play ${title}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="aspect-square w-16 md:w-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all shadow-lg mb-4">
              <svg className="w-7 h-7 md:w-9 md:h-9 text-slate-800 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-white/90 font-medium text-sm md:text-base px-6 text-center leading-snug">{title}</span>
          </div>
        </button>
      )}
    </div>
  )
}
