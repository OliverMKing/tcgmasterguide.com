import Link from 'next/link'
import { getAllAnnouncements } from '@/lib/announcements'
import { AnnouncementCard } from '@/components/AnnouncementCard'
import type { Metadata } from 'next'

// Force static generation at build time
export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Announcements',
  description: 'Latest news, meta updates, tournament results, and site updates from TCG Master Guide.',
  openGraph: {
    title: 'Announcements - TCG Master Guide',
    description: 'Latest news, meta updates, tournament results, and site updates from TCG Master Guide.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Announcements - TCG Master Guide',
    description: 'Latest news, meta updates, tournament results, and site updates from TCG Master Guide.',
  },
}

export default function AnnouncementsPage() {
  const announcements = getAllAnnouncements()

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-slate-900 dark:to-slate-800 relative">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/20 rounded-full blur-3xl -z-10" />

        <h1 className="text-3xl font-bold text-neutral-800 dark:text-slate-100 mb-10">
          Announcements
        </h1>

        {announcements.length === 0 ? (
          <p className="text-neutral-600 dark:text-slate-300">
            No announcements yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.slug}
                slug={announcement.slug}
                title={announcement.title}
                date={announcement.date}
                summary={announcement.summary}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
