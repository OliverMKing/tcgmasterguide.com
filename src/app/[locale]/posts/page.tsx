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

  const [lead, ...earlier] = posts

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-20">
        <header className="max-w-[60ch]">
          <h1 className="font-display font-black text-ink text-6xl sm:text-7xl leading-[0.88]">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-ink-2">{t('subtitle')}</p>
        </header>

        {posts.length === 0 ? (
          <EmptyState className="mt-10" title={t('emptyTitle')} description={t('emptyDescription')} />
        ) : (
          <>
            {/* The newest post leads the page */}
            <div className="mt-10 border-y border-line-strong">
              <PostCard post={lead} variant="lead" />
            </div>

            {earlier.length > 0 && (
              <section aria-labelledby="earlier-posts" className="mt-14 max-w-4xl">
                <h2 id="earlier-posts" className="font-display font-extrabold text-2xl text-ink pb-3">
                  {t('earlierPosts')}
                </h2>
                <ol className="border-t border-line">
                  {earlier.map((post) => (
                    <li key={post.slug} className="border-b border-line">
                      <PostCard post={post} />
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
