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
    <main className="min-h-screen">
      <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 text-ink-2 hover:text-ink font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToPosts')}
        </Link>

        <div className="max-w-[68ch]">
          {/* Article header */}
          <header className="mt-8 sm:mt-10 pb-8 mb-10 border-b border-line">
            <h1 className="font-display font-black text-ink text-5xl sm:text-7xl leading-[0.88] tracking-[-0.01em] break-words">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-ink-2">
              <p>
                {t.rich('byline', {
                  author: (chunks) => <strong className="font-bold text-ink">{chunks}</strong>,
                })}
              </p>
              {post.date && (
                <time dateTime={post.date.slice(0, 10)}>
                  <LocalDate timestamp={post.date} />
                </time>
              )}
            </div>
          </header>

          {/* Post content - fetched client-side with subscription check */}
          <PostContent slug={slug} title={post.title} />
        </div>
      </article>
    </main>
  )
}
