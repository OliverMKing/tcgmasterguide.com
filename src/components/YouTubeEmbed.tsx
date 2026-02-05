'use client'

import { useState } from 'react'
import { useVideoEmbed } from '@/contexts/VideoEmbedContext'

interface YouTubeEmbedProps {
  videoId: string
  title?: string
}

export function YouTubeEmbed({ videoId, title = 'YouTube video' }: YouTubeEmbedProps) {
  const { activeVideoId, setActiveVideoId } = useVideoEmbed()
  const [isExpanded, setIsExpanded] = useState(false)
  const isActive = activeVideoId === `youtube-${videoId}`

  const handlePlay = () => {
    setActiveVideoId(`youtube-${videoId}`)
    setIsExpanded(true)
  }

  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleCollapse = () => {
    setIsExpanded(false)
  }

  return (
    <div className={`my-6 aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg relative transition-all duration-300 ${isExpanded ? 'w-full' : 'w-full max-w-sm'}`}>
      {isActive ? (
        <>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
          <button
            onClick={isExpanded ? handleCollapse : handleExpand}
            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors z-10 cursor-pointer"
            aria-label={isExpanded ? 'Collapse video' : 'Expand video'}
          >
            {isExpanded ? (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </>
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
