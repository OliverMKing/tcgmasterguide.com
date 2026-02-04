'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

export function DeckContent({ slug, title, headings, history, deckTitle }: DeckContentProps) {
  const [content, setContent] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchWithRetry = useFetchWithRetry()

  useEffect(() => {
    async function fetchContent() {
      try {
        // Force token refresh before fetching to ensure subscriber status is current
        let res = await fetchWithRetry(`/api/decks/${slug}/content`, { forceRefresh: true })
        let data = await res.json()

        // If user doesn't have access, retry a few times in case subscription
        // webhook hasn't propagated yet (e.g., just subscribed)
        if (res.ok && !data.hasAccess) {
          for (let attempt = 0; attempt < ACCESS_RETRY_COUNT; attempt++) {
            await sleep(ACCESS_RETRY_DELAY_MS)
            res = await fetchWithRetry(`/api/decks/${slug}/content`, { forceRefresh: true })
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
  }, [slug, fetchWithRetry])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-8"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
      </div>
    )
  }

  // Check if content is only a premium placeholder (no public content at all)
  const isFullyLocked = !hasAccess && content?.trim() === PREMIUM_PLACEHOLDER

  if (isFullyLocked || !content) {
    return <LockedDeckContent title={title} headings={headings} />
  }

  // Create an ID generator for ReactMarkdown headings
  const generateHeadingId = createIdGenerator()

  // For non-subscribers, extract headings only from the content they can see
  const visibleHeadings = hasAccess ? headings : extractHeadingsFromContent(content)

  // Preprocess content to add separators between consecutive lists
  const processedContent = content!.replace(
    /^(- .+)\n\n(- )/gm,
    `$1\n\n${LIST_BREAK_MARKER}\n\n$2`
  )

  return (
    <>
      {/* Free Preview Banner for non-subscribers */}
      {!hasAccess && (
        <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Free Preview</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You&apos;re viewing a limited preview.{' '}
                <Link href="/subscribe" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                  Subscribe
                </Link>
                {' '}for full access to all guides.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View History Button - only for subscribers */}
      {hasAccess && history.length > 0 && (
        <div className="-mt-10 mb-8">
          <ViewHistoryButton history={history} deckTitle={deckTitle} />
        </div>
      )}

      {/* Table of Contents */}
      {visibleHeadings.length > 0 && (
        <nav className="mb-12 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            {hasAccess ? 'Table of Contents' : 'Preview Contents'}
          </h2>
          <ul className="space-y-2">
            {visibleHeadings.map((heading) => (
              <li
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - 1) * 1}rem` }}
              >
                <a
                  href={`#${heading.id}`}
                  className="text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors text-sm"
                >
                  {heading.text}
                </a>
              </li>
            ))}
            {hasAccess && (
              <li style={{ paddingLeft: '1rem' }}>
                <a
                  href="#discussion"
                  className="text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors text-sm"
                >
                  Discussion
                </a>
              </li>
            )}
          </ul>
          {/* Show "What's Inside" teaser for non-subscribers */}
          {!hasAccess && headings.length > visibleHeadings.length && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Full guide includes:
              </p>
              <ul className="space-y-1">
                {headings.slice(visibleHeadings.length, visibleHeadings.length + 4).map((heading) => (
                  <li
                    key={heading.id}
                    className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm"
                  >
                    <svg className="w-3 h-3 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>{heading.text}</span>
                  </li>
                ))}
                {headings.length > visibleHeadings.length + 4 && (
                  <li className="text-slate-400 dark:text-slate-500 text-sm pl-5">
                    + {headings.length - visibleHeadings.length - 4} more sections...
                  </li>
                )}
              </ul>
            </div>
          )}
        </nav>
      )}

      {/* Article Content */}
      <div className="prose prose-slate prose-lg max-w-none dark:prose-invert">
        <ReactMarkdown
          components={{
            h1: ({ children }) => {
              const text = String(children)
              const id = generateHeadingId(text)
              return (
                <h2 id={id} className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4 first:mt-0 pb-2 border-b border-slate-200 dark:border-slate-700 scroll-mt-20">
                  {children}
                </h2>
              )
            },
            h2: ({ children }) => {
              const text = String(children)
              const id = generateHeadingId(text)
              return (
                <h3 id={id} className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4 scroll-mt-20">
                  {children}
                </h3>
              )
            },
            h3: ({ children }) => {
              const text = String(children)
              const id = generateHeadingId(text)
              return (
                <h4 id={id} className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3 scroll-mt-20">
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
                const content = String(codeElement.props.children || '').trim()
                const lines = content.split('\n')
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
                const content = String(codeElement.props.children || '').trim()
                const lines = content.split('\n')
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
      </div>

      {/* Footer CTA */}
      <div className="mt-16">
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Explore More Guides
          </h3>
          <p className="text-purple-100 mb-6">
            Continue your journey with our other expert guides
          </p>
          <Link
            href="/#decks"
            className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors shadow-lg shadow-purple-900/20"
          >
            Browse All Decks
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Comments Section */}
      <Comments deckSlug={slug} deckTitle={title} />
    </>
  )
}
