'use client'

import { useTranslations } from 'next-intl'
import { useVideoEmbed } from '@/contexts/VideoEmbedContext'

interface YouTubeEmbedProps {
  videoId: string
  title?: string
}

export function YouTubeEmbed({ videoId, title = 'YouTube video' }: YouTubeEmbedProps) {
  const t = useTranslations('deck')
  const { activeVideoId, setActiveVideoId, expandedVideoId, setExpandedVideoId } = useVideoEmbed()
  const myId = `youtube-${videoId}`
  const isActive = activeVideoId === myId
  const isExpanded = expandedVideoId === myId

  const handlePlay = () => {
    setActiveVideoId(myId)
    setExpandedVideoId(myId)
  }

  return (
    <div className={`my-8 aspect-video rounded-2xl overflow-hidden border border-line bg-mat relative transition-[max-width] duration-300 ease-snappy ${isExpanded ? 'w-full' : 'w-full max-w-sm'}`}>
      {isActive ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      ) : (
        <button
          onClick={handlePlay}
          className="playmat w-full h-full group cursor-pointer text-left"
          aria-label={t('playVideo', { title })}
        >
          <span className="absolute inset-0 flex flex-col items-start justify-end gap-3 p-4 sm:p-5">
            <span className="flex w-11 h-11 sm:w-12 sm:h-12 items-center justify-center rounded-full bg-mat-ink text-mat transition-[transform,background-color,color] duration-200 ease-snappy group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-ink">
              <svg className="w-5 h-5 translate-x-px" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-mat-ink font-semibold text-sm sm:text-base leading-snug line-clamp-2">{title}</span>
            <span className="absolute top-4 right-4 sm:top-5 sm:right-5 text-xs text-mat-ink-2">YouTube</span>
          </span>
        </button>
      )}
    </div>
  )
}
