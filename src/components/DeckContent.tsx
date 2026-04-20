'use client'

import React, { useState, useEffect, useRef, memo, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { DeckList } from '@/components/DeckList'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import { TwitchVideoEmbed } from '@/components/TwitchVideoEmbed'
import { LockedDeckContent } from '@/components/LockedDeckContent'
import { LockedSection } from '@/components/LockedSection'
import { ViewHistoryButton } from '@/components/ViewHistoryButton'
import Comments from '@/components/Comments'
import { HistoryEntry } from '@/generated/deck-history'
import { useFetchWithRetry } from '@/lib/fetch-with-retry'
import { Skeleton, ReadingProgress } from '@/components/ui'

interface TocItem {
  id: string
  text: string
  level: number
}

interface DeckContentProps {
  slug: string
  title: string
  headings: TocItem[]
  history: HistoryEntry[]
  deckTitle: string
}

const LIST_BREAK_MARKER = '---LIST-BREAK---'
const PREMIUM_PLACEHOLDER = ':::PREMIUM_LOCKED:::'

// Retry config for subscription propagation delays
const ACCESS_RETRY_COUNT = 3
const ACCESS_RETRY_DELAY_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

function createIdGenerator(): (text: string) => string {
  const idCounts: Record<string, number> = {}
  return (text: string) => {
    const baseId = slugify(text)
    if (idCounts[baseId] === undefined) {
      idCounts[baseId] = 0
      return baseId
    } else {
      idCounts[baseId]++
      return `${baseId}-${idCounts[baseId]}`
    }
  }
}

function extractHeadingsFromContent(content: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const headings: TocItem[] = []
  const generateId = createIdGenerator()
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2]
    const id = generateId(text)
    headings.push({ id, text, level })
  }

  return headings
}

function transformImageSrc(src: string): string {
  if (src.startsWith('./images/')) {
    return `/api/deck-images/${src.replace('./images/', '')}`
  }
  return src
}

// Helper to extract plain text from React children
function getTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join('')
  }
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode }
    return getTextFromChildren(props.children)
  }
  return ''
}

// Memoized markdown renderer to prevent iframe remounting on parent re-renders
const MemoizedMarkdown = memo(function MemoizedMarkdown({ content }: { content: string }) {
  // Pre-compute all heading IDs to ensure consistency
  // Extract headings from content and map text to ID
  const headingIdMap = useMemo(() => {
    const map = new Map<string, string>()
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const idCounts: Record<string, number> = {}
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const text = match[2]
      const baseId = slugify(text)

      if (idCounts[baseId] === undefined) {
        idCounts[baseId] = 0
        map.set(text, baseId)
      } else {
        idCounts[baseId]++
        map.set(text, `${baseId}-${idCounts[baseId]}`)
      }
    }

    return map
  }, [content])

  const getHeadingId = (text: string) => headingIdMap.get(text) || slugify(text)

  // Preprocess content to add separators between consecutive lists
  const processedContent = content.replace(
    /^(- .+)\n\n(- )/gm,
    `$1\n\n${LIST_BREAK_MARKER}\n\n$2`
  )

  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => {
          const text = getTextFromChildren(children)
          const id = getHeadingId(text)
          return (
            <h2 id={id} className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4 first:mt-0 pb-2 border-b border-slate-200 dark:border-slate-700 scroll-mt-20 md:scroll-mt-32">
              {children}
            </h2>
          )
        },
        h2: ({ children }) => {
          const text = getTextFromChildren(children)
          const id = getHeadingId(text)
          return (
            <h3 id={id} className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4 scroll-mt-20 md:scroll-mt-32">
              {children}
            </h3>
          )
        },
        h3: ({ children }) => {
          const text = getTextFromChildren(children)
          const id = getHeadingId(text)
          return (
            <h4 id={id} className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3 scroll-mt-20 md:scroll-mt-32">
              {children}
            </h4>
          )
        },
        p: ({ children }) => {
          const text = String(children)
          if (text === LIST_BREAK_MARKER) {
            return <div className="h-4" aria-hidden="true" />
          }
          if (text === PREMIUM_PLACEHOLDER) {
            return <LockedSection />
          }
          return (
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {children}
            </p>
          )
        },
        ul: ({ children }) => (
          <ul className="deck-list space-y-3 text-slate-600 dark:text-slate-300 mb-6 pl-0">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="deck-list space-y-3 text-slate-600 dark:text-slate-300 mb-6 pl-0 list-decimal list-inside">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-slate-600 dark:text-slate-300 relative pl-5 before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-purple-500 dark:before:bg-purple-400">
            {children}
          </li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-slate-700 dark:text-slate-200">{children}</em>
        ),
        code: ({ children }) => (
          <code className="bg-slate-100 dark:bg-slate-700 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        ),
        pre: ({ children }) => {
          const codeElement = children as React.ReactElement<{ className?: string; children?: string }>
          if (codeElement?.props?.className === 'language-decklist') {
            const decklistContent = String(codeElement.props.children || '').trim()
            return <DeckList decklist={decklistContent} />
          }
          if (codeElement?.props?.className === 'language-youtube') {
            const codeContent = String(codeElement.props.children || '').trim()
            const lines = codeContent.split('\n')
            let videoId = ''
            let videoTitle = 'YouTube video'
            for (const line of lines) {
              const [key, ...valueParts] = line.split(':')
              const value = valueParts.join(':').trim()
              if (key.trim() === 'id') videoId = value
              if (key.trim() === 'title') videoTitle = value
            }
            if (videoId) {
              return <YouTubeEmbed videoId={videoId} title={videoTitle} />
            }
          }
          if (codeElement?.props?.className === 'language-twitch') {
            const codeContent = String(codeElement.props.children || '').trim()
            const lines = codeContent.split('\n')
            let videoId = ''
            let videoTitle = 'Twitch video'
            for (const line of lines) {
              const [key, ...valueParts] = line.split(':')
              const value = valueParts.join(':').trim()
              if (key.trim() === 'id') videoId = value
              if (key.trim() === 'title') videoTitle = value
            }
            if (videoId) {
              return <TwitchVideoEmbed videoId={videoId} title={videoTitle} />
            }
          }
          return (
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl overflow-x-auto my-6">
              {children}
            </pre>
          )
        },
        img: ({ src, alt }) => {
          const imageSrc = transformImageSrc(typeof src === 'string' ? src : '')
          return (
            <span className="block my-8 relative">
              <Image
                src={imageSrc}
                alt={alt || ''}
                width={800}
                height={600}
                className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg w-full h-auto"
                unoptimized
              />
            </span>
          )
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
  )
})

export function DeckContent({ slug, title, headings, history, deckTitle }: DeckContentProps) {
  const t = useTranslations('deck')
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
        let res = await fetchWithRetryRef.current(`/api/decks/${slug}/content?locale=${locale}`, { forceRefresh: true })
        let data = await res.json()

        // If user doesn't have access, retry a few times in case subscription
        // webhook hasn't propagated yet (e.g., just subscribed)
        if (res.ok && !data.hasAccess) {
          for (let attempt = 0; attempt < ACCESS_RETRY_COUNT; attempt++) {
            await sleep(ACCESS_RETRY_DELAY_MS)
            res = await fetchWithRetryRef.current(`/api/decks/${slug}/content?locale=${locale}`, { forceRefresh: true })
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
        console.error('Failed to fetch deck content:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [slug, locale])

  if (loading) {
    return (
      <div className="space-y-8" aria-busy="true" aria-label="Loading deck guide">
        {/* TOC skeleton */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3 ml-4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2 ml-4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        {/* Article skeleton */}
        <div className="space-y-4">
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
      </div>
    )
  }

  // Check if content is only a premium placeholder (no public content at all)
  const isFullyLocked = !hasAccess && content?.trim() === PREMIUM_PLACEHOLDER

  if (isFullyLocked || !content) {
    return <LockedDeckContent title={title} headings={headings} />
  }

  // For non-subscribers, extract headings only from the content they can see
  const visibleHeadings = hasAccess ? headings : extractHeadingsFromContent(content)

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

      {/* View History Button - only for English subscribers (history is only generated for English content) */}
      {hasAccess && history.length > 0 && locale === 'en' && (
        <div className="-mt-10 mb-8">
          <ViewHistoryButton history={history} deckTitle={deckTitle} />
        </div>
      )}

      {/* Table of Contents */}
      {visibleHeadings.length > 0 && (
        <nav
          aria-label="Table of contents"
          className="mb-12 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h7" />
              </svg>
            </span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {hasAccess ? t('tableOfContents') : t('previewContents')}
            </h2>
          </div>
          <ul className="space-y-1">
            {(() => {
              const minLevel = visibleHeadings.length > 0 ? Math.min(...visibleHeadings.map((h) => h.level)) : 1
              return visibleHeadings.map((heading) => (
                <li
                  key={heading.id}
                  style={{ paddingLeft: `${(heading.level - minLevel) * 1}rem` }}
                >
                  <a
                    href={`#${heading.id}`}
                    className="text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 transition-colors text-sm py-1"
                  >
                    {heading.text}
                  </a>
                </li>
              ))
            })()}
            {hasAccess && (
              <li>
                <a
                  href="#discussion"
                  className="text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 transition-colors text-sm py-1"
                >
                  {t('discussion')}
                </a>
              </li>
            )}
          </ul>
          {/* Show "What's Inside" teaser for non-subscribers */}
          {!hasAccess && (() => {
            const visibleTexts = new Set(visibleHeadings.map((h) => h.text))
            const hiddenHeadings = headings.filter((h) => !visibleTexts.has(h.text))
            if (hiddenHeadings.length === 0) return null
            return (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  {t('fullGuideIncludes')}
                </p>
                <ul className="space-y-1">
                  {hiddenHeadings.slice(0, 4).map((heading) => (
                    <li
                      key={heading.id}
                      className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm"
                    >
                      <svg className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>{heading.text}</span>
                    </li>
                  ))}
                  {hiddenHeadings.length > 4 && (
                    <li className="text-slate-400 dark:text-slate-500 text-sm pl-5">
                      {t('moreSections', { count: hiddenHeadings.length - 4 })}
                    </li>
                  )}
                </ul>
              </div>
            )
          })()}
        </nav>
      )}

      {/* Article Content */}
      <div className="prose prose-slate prose-lg max-w-none dark:prose-invert">
        <MemoizedMarkdown content={content} />
      </div>

      {/* Footer CTA */}
      <div className="mt-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800/80 border border-violet-100 dark:border-slate-700 rounded-2xl p-8 text-center shadow-sm">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-300/20 dark:bg-violet-500/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-2">
              {t('exploreMoreGuides')}
            </h3>
            <p className="text-neutral-600 dark:text-slate-300 mb-6">
              {t('continueJourney')}
            </p>
            <Link
              href="/#decks"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 ease-snappy active:scale-[0.98]"
            >
              {t('browseAllDecks')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <Comments deckSlug={slug} deckTitle={title} />
    </>
  )
}
