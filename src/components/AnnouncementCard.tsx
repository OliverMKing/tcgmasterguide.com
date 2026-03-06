import Link from 'next/link'
import { LocalDate } from '@/components/LocalDate'

interface AnnouncementCardProps {
  slug: string
  title: string
  date: string
  summary: string
}

export function AnnouncementCard({ slug, title, date, summary }: AnnouncementCardProps) {
  return (
    <Link
      href={`/announcements/${slug}`}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500 transition-all duration-300 p-6 overflow-hidden"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 transition-all duration-500 rounded-2xl" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {title}
          </h3>
        </div>
        <span className="shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-slate-700 flex items-center justify-center ml-3">
          <svg className="w-4 h-4 text-stone-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
      {summary && (
        <p className="relative text-sm text-stone-500 dark:text-slate-400 mt-2 line-clamp-2">
          {summary}
        </p>
      )}
      {date && (
        <p className="relative text-sm text-stone-400 dark:text-slate-500 mt-3">
          <LocalDate timestamp={new Date(date).toISOString()} />
        </p>
      )}
    </Link>
  )
}
