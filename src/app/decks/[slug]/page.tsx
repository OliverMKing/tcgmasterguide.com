import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'
import { LocalDate } from '@/components/LocalDate'
import { PageViewCount } from '@/components/PageViewCount'
import { DeckList } from '@/components/DeckList'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import { TwitchVideoEmbed } from '@/components/TwitchVideoEmbed'
import Comments from '@/components/Comments'
import { ViewHistoryButton } from '@/components/ViewHistoryButton'
import { deckHistory } from '@/generated/deck-history'
import type { Metadata } from 'next'

// Force static generation at build time
export const dynamic = 'force-static'

interface TocItem {
  id: string
  text: string
  level: number
}

function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const headings: TocItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2]
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    headings.push({ id, text, level })
  }

  return headings
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

function getAllDeckSlugs() {
  const decksDirectory = path.join(process.cwd(), 'content', 'decks')
  const filenames = fs.readdirSync(decksDirectory)
  return filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => filename.replace(/\.md$/, ''))
}

function getPokemonSprite(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexId}.png`
}

function getDeckContent(slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'content', 'decks', `${slug}.md`)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    return {
      title: data.title,
      lastEdited: data.lastEdited || null,
      pokemon: (data.pokemon as number[]) || [],
      tier: (data.tier as number) || 3,
      content,
    }
  } catch {
    return null
  }
}

const tierLabels: Record<number, string> = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
}

const tierColors: Record<number, string> = {
  1: 'bg-amber-500',
  2: 'bg-slate-400',
  3: 'bg-amber-700',
}

const LIST_BREAK_MARKER = '---LIST-BREAK---'

export function generateStaticParams() {
  return getAllDeckSlugs().map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const deck = getDeckContent(slug)

  if (!deck) {
    return {
      title: 'Deck Not Found',
    }
  }

  const description = `${deck.title} deck guide for Pokemon TCG. Expert strategy, deck list, and matchup analysis by Grant Manley.`

  return {
    title: deck.title,
    description,
    openGraph: {
      title: `${deck.title} - Pokemon TCG Deck Guide`,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${deck.title} - Pokemon TCG Deck Guide`,
      description,
    },
  }
}

export default async function DeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const deck = getDeckContent(slug)

  if (!deck) {
    notFound()
  }

  const headings = extractHeadings(deck.content)
  const history = deckHistory[slug] || []

  // Preprocess content to add separators between consecutive lists
  // Pattern: list item, blank line, list item -> insert a separator
  const processedContent = deck.content.replace(
    /^(- .+)\n\n(- )/gm,
    `$1\n\n${LIST_BREAK_MARKER}\n\n$2`
  )

  // Transform relative image paths to API route
  const transformImageSrc = (src: string) => {
    if (src.startsWith('./images/')) {
      return `/api/deck-images/${src.replace('./images/', '')}`
    }
    return src
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/#decks"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Guides
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {deck.title}
            </h1>
            {deck.pokemon.length > 0 && (
              <div className="flex -space-x-2">
                {deck.pokemon.map((id) => (
                  <Image
                    key={id}
                    src={getPokemonSprite(id)}
                    alt=""
                    width={64}
                    height={64}
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                    unoptimized
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className={`${tierColors[deck.tier]} text-white text-sm font-bold px-3 py-1 rounded-full`}>
              {tierLabels[deck.tier]}
            </span>
          </div>
          {deck.lastEdited && (
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <LocalDate timestamp={deck.lastEdited} prefix="Last updated " />
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <ViewHistoryButton history={history} deckTitle={deck.title} />
              <PageViewCount slug={slug} />
            </div>
          )}
        </header>

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
                const id = slugify(text)
                return (
                  <h2 id={id} className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4 first:mt-0 pb-2 border-b border-slate-200 dark:border-slate-700 scroll-mt-20">
                    {children}
                  </h2>
                )
              },
              h2: ({ children }) => {
                const text = String(children)
                const id = slugify(text)
                return (
                  <h3 id={id} className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4 scroll-mt-20">
                    {children}
                  </h3>
                )
              },
              h3: ({ children }) => {
                const text = String(children)
                const id = slugify(text)
                return (
                  <h4 id={id} className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3 scroll-mt-20">
                    {children}
                  </h4>
                )
              },
              p: ({ children }) => {
                // Check if this is a list break marker
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
                // Check if this is a decklist code block
                const codeElement = children as React.ReactElement<{ className?: string; children?: string }>
                if (codeElement?.props?.className === 'language-decklist') {
                  const decklistContent = String(codeElement.props.children || '').trim()
                  return <DeckList decklist={decklistContent} />
                }
                // Check if this is a youtube code block
                if (codeElement?.props?.className === 'language-youtube') {
                  const content = String(codeElement.props.children || '').trim()
                  const lines = content.split('\n')
                  let videoId = ''
                  let title = 'YouTube video'
                  for (const line of lines) {
                    const [key, ...valueParts] = line.split(':')
                    const value = valueParts.join(':').trim()
                    if (key.trim() === 'id') videoId = value
                    if (key.trim() === 'title') title = value
                  }
                  if (videoId) {
                    return <YouTubeEmbed videoId={videoId} title={title} />
                  }
                }
                // Check if this is a twitch code block
                if (codeElement?.props?.className === 'language-twitch') {
                  const content = String(codeElement.props.children || '').trim()
                  const lines = content.split('\n')
                  let videoId = ''
                  let title = 'Twitch video'
                  for (const line of lines) {
                    const [key, ...valueParts] = line.split(':')
                    const value = valueParts.join(':').trim()
                    if (key.trim() === 'id') videoId = value
                    if (key.trim() === 'title') title = value
                  }
                  if (videoId) {
                    return <TwitchVideoEmbed videoId={videoId} title={title} />
                  }
                }
                // Default pre rendering
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
        <Comments deckSlug={slug} deckTitle={deck.title} />
      </article>
    </main>
  )
}
