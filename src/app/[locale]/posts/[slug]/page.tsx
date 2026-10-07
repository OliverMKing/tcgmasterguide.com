import { Link } from '@/i18n/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { LocalDate } from '@/components/LocalDate'
import { PostContent } from '@/components/PostContent'
import { getAllPostSlugs, getPostMetadata } from '@/lib/posts'
import type { Metadata } from 'next'

// Static generation - content is fetched client-side via API with subscription check
export const dynamic = 'force-static'

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostMetadata(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const description = `${post.title} - Pokemon TCG event guidance by Grant Manley.`

  return {
    title: post.title,
    description,
    openGraph: {
      title: `${post.title} - TCG Master Guide`,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - TCG Master Guide`,
      description,
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('post')
  const post = getPostMetadata(slug, locale)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header - sticky below navbar on md+ screens, static on small screens */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm md:sticky md:top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('backToPosts')}
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-3">
            {post.title}
          </h1>
          {post.date && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <LocalDate timestamp={post.date} />
            </div>
          )}
        </header>

        {/* Post Content - fetched client-side with subscription check */}
        <PostContent slug={slug} title={post.title} />
      </article>
    </main>
  )
}
