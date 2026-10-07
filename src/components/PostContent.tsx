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
    return <LockedDeckContent title={title} headings={[]} />
  }

  return (
    <>
      <ReadingProgress />
      {/* Free Preview Banner for non-subscribers */}
      {!hasAccess && (
        <div className="mb-8 p-5 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-fuchsia-900/20 rounded-2xl border border-violet-200/70 dark:border-violet-800/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 bg-violet-100 text-violet-600 dark:bg-slate-700/60 dark:text-violet-400 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{t('freePreview')}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {t('limitedPreview')}{' '}
                <Link href="/subscribe" className="text-violet-600 dark:text-violet-400 hover:underline underline-offset-4 font-medium">
                  {t('subscribeForAccess')}
                </Link>
                {' '}{t('forFullAccess')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-slate prose-lg max-w-none dark:prose-invert">
        <MarkdownContent content={content} imageApiBase="/api/post-images" />
      </div>

      {/* Footer CTA */}
      <div className="mt-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800/80 border border-violet-100 dark:border-slate-700 rounded-2xl p-8 text-center shadow-sm">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-300/20 dark:bg-violet-500/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-2">
              {t('exploreMorePosts')}
            </h3>
            <p className="text-neutral-600 dark:text-slate-300 mb-6">
              {t('continueReading')}
            </p>
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 ease-snappy active:scale-[0.98]"
            >
              {t('browseAllPosts')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <Comments deckSlug={`post:${slug}`} deckTitle={title} />
    </>
  )
}
