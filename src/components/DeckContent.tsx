'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { DeckList } from '@/components/DeckList'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import { TwitchVideoEmbed } from '@/components/TwitchVideoEmbed'
import { LockedDeckContent } from '@/components/LockedDeckContent'
import { ViewHistoryButton } from '@/components/ViewHistoryButton'
import Comments from '@/components/Comments'
import { HistoryEntry } from '@/generated/deck-history'

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

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/decks/${slug}/content`)
        const data = await res.json()

        if (res.ok && data.hasAccess) {
          setContent(data.content)
          setHasAccess(true)
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
  }, [slug])

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

  if (!hasAccess) {
    return <LockedDeckContent title={title} headings={headings} />
  }

  // Create an ID generator for ReactMarkdown headings
  const generateHeadingId = createIdGenerator()

  // Preprocess content to add separators between consecutive lists
  const processedContent = content!.replace(
    /^(- .+)\n\n(- )/gm,
    `$1\n\n${LIST_BREAK_MARKER}\n\n$2`
  )

  return (
    <>
      {/* View History Button */}
      {history.length > 0 && (
        <div className="-mt-10 mb-8">
          <ViewHistoryButton history={history} deckTitle={deckTitle} />
        </div>
      )}

      {/* Table of Contents */}
      {headings.length > 0 && (
        <nav className="mb-12 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            {headings.map((heading) => (
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
            <li style={{ paddingLeft: '1rem' }}>
              <a
                href="#discussion"
                className="text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors text-sm"
              >
                Discussion
              </a>
            </li>
          </ul>
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
