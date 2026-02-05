'use client'

import { useEffect, useState } from 'react'
import { useVideoEmbed } from '@/contexts/VideoEmbedContext'

interface TwitchVideoEmbedProps {
  videoId: string
  title?: string
}

export function TwitchVideoEmbed({ videoId, title = 'Twitch video' }: TwitchVideoEmbedProps) {
  const [parent, setParent] = useState('localhost')
  const { activeVideoId, setActiveVideoId, expandedVideoId, setExpandedVideoId } = useVideoEmbed()
  const myId = `twitch-${videoId}`
  const isActive = activeVideoId === myId
  const isExpanded = expandedVideoId === myId

  useEffect(() => {
    setParent(window.location.hostname)
  }, [])

  const handlePlay = () => {
    setActiveVideoId(myId)
    setExpandedVideoId(myId)
  }

  return (
    <div className={`my-6 aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg relative transition-all duration-300 ${isExpanded ? 'w-full' : 'w-full max-w-sm'}`}>
      {isActive ? (
        <iframe
          src={`https://player.twitch.tv/?video=${videoId}&parent=${parent}&autoplay=true`}
          title={title}
          allowFullScreen
          className="w-full h-full"
        />
      ) : (
        <button
          onClick={handlePlay}
          className="w-full h-full relative group cursor-pointer bg-slate-800"
          aria-label={`Play ${title}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="aspect-square w-12 md:w-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all shadow-lg mb-2">
              <svg className="w-5 h-5 md:w-7 md:h-7 text-slate-800 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-white/90 font-medium text-xs md:text-sm px-4 text-center leading-snug">{title}</span>
          </div>
        </button>
      )}
    </div>
  )
}
