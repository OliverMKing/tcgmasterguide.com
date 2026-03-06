import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LocalDate } from '@/components/LocalDate'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { getAllAnnouncementSlugs, getAnnouncementBySlug } from '@/lib/announcements'
import type { Metadata } from 'next'

// Force static generation at build time
export const dynamic = 'force-static'

export function generateStaticParams() {
  return getAllAnnouncementSlugs().map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const announcement = getAnnouncementBySlug(slug)

  if (!announcement) {
    return {
      title: 'Announcement Not Found',
    }
  }

  const description = announcement.summary || `${announcement.title} - TCG Master Guide Announcement`

  return {
    title: announcement.title,
    description,
    openGraph: {
      title: `${announcement.title} - TCG Master Guide`,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${announcement.title} - TCG Master Guide`,
      description,
    },
  }
}

export default async function AnnouncementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const announcement = getAnnouncementBySlug(slug)

  if (!announcement) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm md:sticky md:top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
            {announcement.title}
          </h1>
          {announcement.date && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <LocalDate timestamp={new Date(announcement.date).toISOString()} prefix="Published " />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-slate prose-lg max-w-none dark:prose-invert">
          <MarkdownRenderer content={announcement.content} />
        </div>

      </article>
    </main>
  )
}
