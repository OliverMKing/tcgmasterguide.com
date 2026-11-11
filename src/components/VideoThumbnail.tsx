import Image from 'next/image'
import { LogoMark } from '@/components/Logo'

/** The thumbnail URL for a YouTube video, served from our own domain. */
export function videoThumbnailSrc(videoId: string, size: 'sm' | 'lg' = 'sm'): string {
  return `/api/video-thumbnails/${videoId}${size === 'lg' ? '?size=large' : ''}`
}

interface VideoThumbnailProps {
  videoId?: string
  size?: 'sm' | 'lg'
  /** Load right away (for the first thumbnail on a page). */
  eager?: boolean
  className?: string
}

/**
 * A 16:9 video thumbnail with a small play mark. Posts without a video get a
 * mat tile with the logo, so every row keeps the same shape.
 */
export function VideoThumbnail({ videoId, size = 'sm', eager = false, className = '' }: VideoThumbnailProps) {
  const radius = size === 'lg' ? 'rounded-[16px]' : 'rounded-[10px]'
  return (
    <div className={`relative aspect-video overflow-hidden bg-mat-2 ${radius} ${className}`}>
      {videoId ? (
        <>
          {/* YouTube thumbnails are 4:3 with letterbox bars; cover crops them away */}
          <Image
            src={videoThumbnailSrc(videoId, size)}
            alt=""
            fill
            unoptimized
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : undefined}
            sizes={size === 'lg' ? '(min-width: 768px) 560px, 100vw' : '176px'}
            className="object-cover transition-transform duration-500 ease-snappy group-hover:scale-[1.03]"
          />
          <span
            aria-hidden="true"
            className={`absolute left-2.5 bottom-2.5 flex items-center justify-center rounded-full bg-mat/85 text-mat-ink transition-colors group-hover:bg-accent group-hover:text-accent-ink ${
              size === 'lg' ? 'size-12 left-4 bottom-4' : 'size-7'
            }`}
          >
            <svg className={size === 'lg' ? 'size-5 translate-x-px' : 'size-3 translate-x-px'} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </>
      ) : (
        <div className="playmat absolute inset-0 flex items-center justify-center">
          <LogoMark className={size === 'lg' ? 'size-20' : 'size-10'} />
        </div>
      )}
    </div>
  )
}
