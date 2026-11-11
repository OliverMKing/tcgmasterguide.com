'use client'

import { useState, useEffect, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { LockedDeckContent } from '@/components/LockedDeckContent'
import { MarkdownContent } from '@/components/MarkdownContent'
import Comments from '@/components/Comments'
import { useFetchWithRetry } from '@/lib/fetch-with-retry'
import { PREMIUM_PLACEHOLDER } from '@/lib/content-visibility'
import { Skeleton, ReadingProgress } from '@/components/ui'

interface PostContentProps {
  slug: string
  title: string
}

// Retry config for subscription propagation delays
const ACCESS_RETRY_COUNT = 3
const ACCESS_RETRY_DELAY_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function PostContent({ slug, title }: PostContentProps) {
  const t = useTranslations('post')
  const locale = useLocale()
  const [content, setContent] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchWithRetry = useFetchWithRetry()
  const fetchWithRetryRef = useRef(fetchWithRetry)
  fetchWithRetryRef.current = fetchWithRetry

  useEffect(() => {
    async function fetchContent() {
      try {
        // Force token refresh before fetching to ensure subscriber status is current
        let res = await fetchWithRetryRef.current(`/api/posts/${slug}/content?locale=${locale}`, { forceRefresh: true })
        let data = await res.json()

        // If user doesn't have access, retry a few times in case subscription
        // webhook hasn't propagated yet (e.g., just subscribed)
        if (res.ok && !data.hasAccess) {
          for (let attempt = 0; attempt < ACCESS_RETRY_COUNT; attempt++) {
            await sleep(ACCESS_RETRY_DELAY_MS)
            res = await fetchWithRetryRef.current(`/api/posts/${slug}/content?locale=${locale}`, { forceRefresh: true })
            data = await res.json()
            if (data.hasAccess) break
          }
        }

        if (res.ok) {
          setContent(data.content)
          setHasAccess(data.hasAccess)
        } else {
          setHasAccess(false)
        }
      } catch (error) {
        console.error('Failed to fetch post content:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [slug, locale])

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading post">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
        <div className="pt-6">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-11/12 mt-2" />
        </div>
      </div>
    )
  }

  // Check if content is only a premium placeholder (no public content at all)
  const isFullyLocked = !hasAccess && content?.trim() === PREMIUM_PLACEHOLDER

  if (isFullyLocked || !content) {
    return <LockedDeckContent title={title} headings={[]} kind="post" />
  }

  return (
    <>
      <ReadingProgress />
      {/* Free preview notice for non-subscribers */}
      {!hasAccess && (
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-line bg-surface p-5">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink">{t('freePreview')}</p>
            <p className="text-ink-2 mt-0.5">
              {t('limitedPreview')} {t('previewCta')}
            </p>
          </div>
          <Link
            href="/subscribe"
            className="inline-flex items-center justify-center shrink-0 rounded-[10px] bg-accent text-accent-ink hover:bg-accent-hover font-semibold px-5 py-2.5 transition-colors"
          >
            {t('subscribeForAccess')}
          </Link>
        </div>
      )}

      {/* Article content. MarkdownContent frames images on a playmat. */}
      <div className="guide-prose">
        <MarkdownContent content={content} imageApiBase="/api/post-images" videoLayout="full" />
      </div>

      {/* More posts */}
      <div className="mt-16 border-t border-line pt-10">
        <h2 className="font-display font-extrabold text-3xl text-ink">
          {t('exploreMorePosts')}
        </h2>
        <p className="mt-2 text-ink-2">{t('continueReading')}</p>
        <Link
          href="/posts"
          className="mt-5 inline-flex items-center rounded-[10px] border border-line-strong hover:border-ink text-ink font-semibold px-5 py-2.5 transition-colors"
        >
          {t('browseAllPosts')}
        </Link>
      </div>

      {/* Comments Section */}
      <Comments deckSlug={`post:${slug}`} deckTitle={title} />
    </>
  )
}
