'use client'

import React, { memo, useMemo } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { DeckList } from '@/components/DeckList'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import { TwitchVideoEmbed } from '@/components/TwitchVideoEmbed'
import { LockedSection } from '@/components/LockedSection'
import { PREMIUM_PLACEHOLDER } from '@/lib/content-visibility'

const LIST_BREAK_MARKER = '---LIST-BREAK---'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
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

function transformImageSrc(src: string, imageApiBase: string): string {
  if (src.startsWith('./images/')) {
    return `${imageApiBase}/${src.replace('./images/', '')}`
  }
  return src
}

interface MarkdownContentProps {
  content: string
  // API base path used to resolve relative ./images/ references.
  imageApiBase?: string
}

// Memoized markdown renderer to prevent iframe remounting on parent re-renders
export const MarkdownContent = memo(function MarkdownContent({
  content,
  imageApiBase = '/api/deck-images',
}: MarkdownContentProps) {
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
          const imageSrc = transformImageSrc(typeof src === 'string' ? src : '', imageApiBase)
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
