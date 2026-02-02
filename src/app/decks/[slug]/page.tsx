import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { LocalDate } from '@/components/LocalDate'
import { DeckContent } from '@/components/DeckContent'
import { deckHistory } from '@/generated/deck-history'
import { deckDates } from '@/generated/deck-dates'
import type { Metadata } from 'next'

// Static generation - content is fetched client-side via API with subscription check
export const dynamic = 'force-static'

interface TocItem {
  id: string
  text: string
  level: number
}

function extractHeadings(content: string): TocItem[] {
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

// Creates a function that generates unique IDs, tracking duplicates
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

function getDeckMetadata(slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'content', 'decks', `${slug}.md`)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    return {
      title: data.title,
      pokemon: (data.pokemon as number[]) || [],
      tier: (data.tier as number) || 3,
      headings: extractHeadings(content),
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
  const deck = getDeckMetadata(slug)

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
  const deck = getDeckMetadata(slug)

  if (!deck) {
    notFound()
  }

  const history = deckHistory[slug] || []
  const lastEdited = deckDates[slug] || null

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
          {lastEdited && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <LocalDate timestamp={lastEdited} prefix="Last updated " />
            </div>
          )}
        </header>

        {/* Deck Content - fetched client-side with subscription check */}
        <DeckContent slug={slug} title={deck.title} headings={deck.headings} history={history} deckTitle={deck.title} />
      </article>
    </main>
  )
}
