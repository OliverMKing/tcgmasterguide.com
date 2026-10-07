import { setRequestLocale, getTranslations } from 'next-intl/server'
import { PostCard } from '@/components/PostCard'
import { EmptyState } from '@/components/ui'
import { getAllPosts, type Locale } from '@/lib/posts'
import type { Metadata } from 'next'

// Force static generation at build time
export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Posts',
  description:
    'Pre-event and post-event Pokemon TCG guidance from TCG Master Guide. Tournament prep, metagame calls, and event recaps by Grant Manley.',
  openGraph: {
    title: 'Posts - TCG Master Guide',
    description:
      'Pre-event and post-event Pokemon TCG guidance from TCG Master Guide.',
  },
}

export default async function PostsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('posts')
  const posts = getAllPosts(locale as Locale)

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="border-b border-stone-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-slate-100 mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
