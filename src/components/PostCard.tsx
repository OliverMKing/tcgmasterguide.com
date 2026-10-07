'use client'

import { Link } from '@/i18n/navigation'
import { LocalDate } from '@/components/LocalDate'

interface Post {
  slug: string
  title: string
  date: string
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 shadow-card hover:shadow-card-hover hover:border-violet-300 dark:hover:border-violet-500 transition-all duration-300 ease-snappy p-6 overflow-hidden flex flex-col h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 transition-all duration-500 rounded-2xl" />

      <div className="relative flex items-center justify-between gap-3 flex-1">
        <h3 className="text-lg font-medium text-neutral-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors break-words">
          {post.title}
        </h3>
        <span className="shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40 group-hover:translate-x-0.5 transition-all duration-300">
          <svg className="w-4 h-4 text-stone-400 dark:text-slate-400 group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
      {post.date && (
        <p className="relative text-xs text-stone-400 dark:text-slate-500 mt-auto pt-3 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
          </svg>
          <LocalDate timestamp={post.date} />
        </p>
      )}
    </Link>
  )
}
