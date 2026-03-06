'use client'

import React, { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { DeckList } from '@/components/DeckList'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import { TwitchVideoEmbed } from '@/components/TwitchVideoEmbed'
import { LockedSection } from '@/components/LockedSection'

const LIST_BREAK_MARKER = '---LIST-BREAK---'
const PREMIUM_PLACEHOLDER = ':::PREMIUM_LOCKED:::'

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

function transformImageSrc(src: string, imagePathPrefix: string): string {
  if (src.startsWith('./images/')) {
    return `${imagePathPrefix}${src.replace('./images/', '')}`
  }
  return src
}

interface MarkdownRendererProps {
  content: string
  imagePathPrefix?: string
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  imagePathPrefix = '/api/deck-images/',
}: MarkdownRendererProps) {
  // Create an ID generator scoped to this render
  const generateHeadingId = createIdGenerator()

  // Preprocess content to add separators between consecutive lists
  const processedContent = content.replace(
    /^(- .+)\n\n(- )/gm,
    `$1\n\n${LIST_BREAK_MARKER}\n\n$2`
  )

  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => {
          const text = String(children)
          const id = generateHeadingId(text)
          return (
            <h2 id={id} className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4 first:mt-0 pb-2 border-b border-slate-200 dark:border-slate-700 scroll-mt-20 md:scroll-mt-32">
              {children}
            </h2>
          )
        },
        h2: ({ children }) => {
          const text = String(children)
          const id = generateHeadingId(text)
          return (
            <h3 id={id} className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4 scroll-mt-20 md:scroll-mt-32">
              {children}
            </h3>
          )
        },
        h3: ({ children }) => {
          const text = String(children)
          const id = generateHeadingId(text)
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
        a: ({ href, children }) => {
          const linkClass = "text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 underline decoration-purple-300 dark:decoration-purple-600 underline-offset-2 hover:decoration-purple-500 dark:hover:decoration-purple-400 transition-colors"
          if (href && (href.startsWith('/') || href.startsWith('#'))) {
            return (
              <Link href={href} className={linkClass}>
                {children}
              </Link>
            )
          }
          return (
            <a href={href} className={linkClass}>
              {children}
            </a>
          )
        },
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
          const imageSrc = transformImageSrc(typeof src === 'string' ? src : '', imagePathPrefix)
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
