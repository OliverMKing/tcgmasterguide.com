import { Link } from '@/i18n/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { LocalDate } from '@/components/LocalDate'
import { DeckContent, DeckAccessProvider, DeckGuideCard, DeckHistoryControl, MatSkeleton } from '@/components/DeckContent'
import { TierBadge } from '@/components/TierBadge'
import { FormatBadge } from '@/components/FormatBadge'
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

type DeckFormat = 'Standard' | 'Post-Rotation'

function getDeckMetadata(slug: string, locale: string = 'en') {
  // For Spanish locale, only return Spanish content (no fallback to English)
  if (locale === 'es') {
    const esFilePath = path.join(process.cwd(), 'content', 'decks', 'es', `${slug}.md`)
    if (!fs.existsSync(esFilePath)) {
      return null // Spanish deck doesn't exist - will trigger 404
    }
    try {
      const fileContent = fs.readFileSync(esFilePath, 'utf8')
      const { data, content } = matter(fileContent)
      return {
        title: data.title,
        pokemon: (data.pokemon as number[]) || [],
        tier: (data.tier as number) || 3,
        format: (data.format as DeckFormat) || 'Standard',
        headings: extractHeadings(content),
      }
    } catch {
      return null
    }
  }

  // English locale
  try {
    const filePath = path.join(process.cwd(), 'content', 'decks', `${slug}.md`)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    return {
      title: data.title,
      pokemon: (data.pokemon as number[]) || [],
      tier: (data.tier as number) || 3,
      format: (data.format as DeckFormat) || 'Standard',
      headings: extractHeadings(content),
    }
  } catch {
    return null
  }
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

export default async function DeckPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('deck')
  const tHome = await getTranslations('home')
  const deck = getDeckMetadata(slug, locale)

  if (!deck) {
    notFound()
  }

  const history = deckHistory[locale]?.[slug] || []
  const lastEdited = deckDates[slug] || null

  const tierLabelsTranslated: Record<number, string> = {
    1: tHome('tier1'),
    2: tHome('tier2'),
    3: tHome('tier3'),
    4: tHome('tier4'),
  }

  const formatLabelsTranslated: Record<DeckFormat, string> = {
    'Standard': tHome('formatStandard'),
    'Post-Rotation': tHome('formatPostRotation'),
  }

  const multiFormat = process.env.NEXT_PUBLIC_ENABLE_MULTI_FORMAT === 'true'

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <DeckAccessProvider>
          <Link
            href="/#decks"
            className="mt-5 sm:mt-7 inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-ink-2 hover:text-ink transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('backToGuides')}
          </Link>

          {/* The deck on the mat: the one bold element on this page */}
          <header className="playmat mt-3 flex items-center gap-5 rounded-[28px] p-4 sm:gap-10 sm:p-8 lg:px-10">
            <DeckGuideCard
              title={deck.title}
              pokemon={deck.pokemon}
              footer={formatLabelsTranslated[deck.format]}
              tier={deck.tier}
              className="w-[108px] shrink-0 sm:w-[184px]"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {multiFormat && (
                  <FormatBadge format={deck.format} label={formatLabelsTranslated[deck.format]} size="md" />
                )}
                <TierBadge tier={deck.tier} label={tierLabelsTranslated[deck.tier]} size="md" />
              </div>
              <h1 className="mt-3 sm:mt-4 font-display font-black text-mat-ink text-[2.5rem] sm:text-6xl lg:text-[5.5rem] leading-[0.88] break-words">
                {deck.title}
              </h1>
              <div className="mt-3 sm:mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-mat-ink-2">
                {lastEdited && (
                  <LocalDate
                    timestamp={lastEdited}
                    prefixKey="deck.lastUpdated"
                    placeholder={<MatSkeleton className="h-4 w-[12.5rem]" />}
                  />
                )}
                <DeckHistoryControl history={history} deckTitle={deck.title} />
              </div>
            </div>
          </header>

          <div className="mt-10 sm:mt-14">
            {/* Deck content: fetched client-side with a subscription check */}
            <DeckContent slug={slug} title={deck.title} headings={deck.headings} />
          </div>
        </DeckAccessProvider>
      </div>
    </main>
  )
}
