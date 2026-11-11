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

type VerdictTone = 'good' | 'bad' | 'neutral'

// Matchup headings read "Raging Bolt - Favorable". The verdict is shown as a small
// status label. Only known verdict words match, so other headings with a dash stay as written.
const VERDICT_PATTERN =
  /^(?:(?:very|slightly|slighty|muy|ligeramente)\s+)?(?:un|des)?favorable$|^(?:even|parejo)$|^depend(?:s|e)\b.*$|^auto[- ]?(?:win|loss)$/i

function parseMatchup(text: string): { name: string; verdict: string; tone: VerdictTone } | null {
  const match = /^(.+?)\s+-\s+([^-]+(?:-[a-z]+)?)$/i.exec(text.trim())
  if (!match) return null
  const [, name, verdict] = match
  if (!VERDICT_PATTERN.test(verdict.trim())) return null
  const v = verdict.toLowerCase()
  let tone: VerdictTone = 'neutral'
  if (/unfav|desfav|loss/.test(v)) tone = 'bad'
  else if (/fav|win/.test(v)) tone = 'good'
  return { name, verdict: verdict.trim(), tone }
}

const verdictTone: Record<VerdictTone, string> = {
  good: 'text-ok',
  bad: 'text-bad',
  neutral: 'text-ink-3',
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
            <h2
              id={id}
              className="font-display font-black text-ink text-[2.5rem] sm:text-5xl leading-[0.9] mt-16 mb-6 first:mt-0 scroll-mt-24"
            >
              {children}
            </h2>
          )
        },
        h2: ({ children }) => {
          const text = getTextFromChildren(children)
          const id = getHeadingId(text)
          return (
            <h3
              id={id}
              className="font-display font-black text-ink text-[2.25rem] leading-[0.92] mt-16 mb-5 pt-8 border-t border-line first:mt-0 first:pt-0 first:border-t-0 scroll-mt-24"
            >
              {children}
            </h3>
          )
        },
        h3: ({ children }) => {
          const text = getTextFromChildren(children)
          const id = getHeadingId(text)
          const matchup = typeof children === 'string' ? parseMatchup(children) : null
          return (
            <h4
              id={id}
              className="font-display font-extrabold text-ink text-[1.75rem] leading-[0.95] mt-12 mb-3 scroll-mt-24"
            >
              {matchup ? (
                <>
                  {matchup.name}
                  <span className="sr-only"> - </span>
                  <span
                    className={`ml-3 inline-flex items-center gap-1.5 align-[0.2em] font-sans text-[0.9375rem] font-bold leading-none tracking-normal whitespace-nowrap ${verdictTone[matchup.tone]}`}
                  >
                    <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                    {matchup.verdict}
                  </span>
                </>
              ) : (
                children
              )}
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
          return <p className="mb-6">{children}</p>
        },
        ul: ({ children }) => (
          <ul className="deck-list space-y-2.5 mb-6 pl-0">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="deck-list space-y-2.5 mb-6 pl-6 list-decimal marker:text-ink-3 marker:font-semibold [&>li]:pl-1.5 [&>li]:before:hidden">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="relative pl-6 before:content-[''] before:absolute before:left-1 before:top-[0.62em] before:w-[6px] before:h-[8.5px] before:rounded-[1.5px] before:bg-accent">
            {children}
          </li>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-ink">{children}</strong>
        ),
        em: ({ children }) => <em className="italic text-ink">{children}</em>,
        code: ({ children }) => (
          <code className="bg-surface-2 text-ink border border-line px-1.5 py-px rounded-md text-[0.85em] font-mono">
            {children}
          </code>
        ),
        hr: () => <hr className="my-12 border-0 border-t border-line" />,
        blockquote: ({ children }) => (
          <blockquote className="my-8 border-l-2 border-accent pl-5 text-ink">{children}</blockquote>
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
            <pre className="bg-surface-2 border border-line p-4 rounded-2xl overflow-x-auto my-6 text-sm leading-relaxed [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0">
              {children}
            </pre>
          )
        },
        img: ({ src, alt }) => {
          const imageSrc = transformImageSrc(typeof src === 'string' ? src : '', imageApiBase)
          return (
            <span className="playmat block my-10 rounded-[20px] p-2 sm:p-3">
              <Image
                src={imageSrc}
                alt={alt || ''}
                width={800}
                height={600}
                className="block rounded-[10px] w-full h-auto"
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
