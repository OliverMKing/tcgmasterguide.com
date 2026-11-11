'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { LocalDate } from '@/components/LocalDate'
import { VideoThumbnail } from '@/components/VideoThumbnail'

interface Post {
  slug: string
  title: string
  date: string
  videoId?: string
}

interface PostCardProps {
  post: Post
  /** "lead" is the newest post at the top of the index; "row" is a line in the list below it. */
  variant?: 'lead' | 'row'
}

export function PostCard({ post, variant = 'row' }: PostCardProps) {
  const t = useTranslations('posts')

  if (variant === 'lead') {
    // The newest post sits on the playmat: the one bold element on the page.
    return (
      <Link
        href={`/posts/${post.slug}`}
        className="group playmat grid items-center gap-6 rounded-[28px] p-4 sm:p-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10 md:p-8"
      >
        <VideoThumbnail videoId={post.videoId} size="lg" eager />
        <div className="px-1 pb-2 md:px-0 md:pb-0">
          <h2 className="font-display font-black text-mat-ink text-5xl sm:text-6xl leading-[0.88] tracking-[-0.01em] break-words">
            {post.title}
          </h2>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            {post.date && (
              <time dateTime={post.date.slice(0, 10)} className="text-mat-ink-2 min-h-[1.5em]">
                <LocalDate timestamp={post.date} />
              </time>
            )}
            <span className="font-semibold text-mat-ink underline decoration-accent decoration-2 underline-offset-4 group-hover:decoration-[3px]">
              {t('readPost')}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group grid grid-cols-[7.5rem_minmax(0,1fr)] sm:grid-cols-[11rem_minmax(0,1fr)] items-center gap-4 sm:gap-6 py-4 -mx-3 px-3 rounded-[14px] hover:bg-surface-2 transition-colors"
    >
      <VideoThumbnail videoId={post.videoId} />
      <div className="min-w-0">
        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink leading-tight break-words group-hover:text-accent-text transition-colors">
          {post.title}
        </h3>
        {post.date && (
          <time dateTime={post.date.slice(0, 10)} className="mt-1 block text-sm sm:text-base text-ink-3 min-h-[1.25em]">
            <LocalDate timestamp={post.date} format="short" />
          </time>
        )}
      </div>
    </Link>
  )
}
