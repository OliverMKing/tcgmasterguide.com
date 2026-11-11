'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { LocalDate } from '@/components/LocalDate'

interface Post {
  slug: string
  title: string
  date: string
}

interface PostCardProps {
  post: Post
  /** "lead" is the newest post at the top of the index; "row" is a line in the list below it. */
  variant?: 'lead' | 'row'
}

export function PostCard({ post, variant = 'row' }: PostCardProps) {
  const t = useTranslations('posts')

  if (variant === 'lead') {
    return (
      <Link href={`/posts/${post.slug}`} className="group block py-10 sm:py-14">
        <h2 className="font-display font-black text-ink text-5xl sm:text-7xl leading-[0.88] tracking-[-0.01em] max-w-[20ch] break-words group-hover:text-accent-text transition-colors">
          {post.title}
        </h2>
        <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {post.date && (
            <time dateTime={post.date.slice(0, 10)} className="text-ink-2 min-h-[1.5em]">
              <LocalDate timestamp={post.date} />
            </time>
          )}
          <span className="font-semibold text-accent-text underline decoration-1 underline-offset-4 group-hover:decoration-2">
            {t('readPost')}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group grid gap-1 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6 sm:items-baseline py-5 sm:py-6 -mx-3 px-3 rounded-[10px] hover:bg-surface-2 transition-colors"
    >
      <span className="order-2 sm:order-1 text-sm sm:text-base text-ink-3 min-h-[1.25em]">
        {post.date && (
          <time dateTime={post.date.slice(0, 10)}>
            <LocalDate timestamp={post.date} format="short" />
          </time>
        )}
      </span>
      <h3 className="order-1 sm:order-2 font-display font-extrabold text-2xl sm:text-3xl text-ink leading-tight break-words group-hover:text-accent-text transition-colors">
        {post.title}
      </h3>
    </Link>
  )
}
