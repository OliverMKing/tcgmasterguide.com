import { Link } from '@/i18n/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { LocalDate } from '@/components/LocalDate'
import LiveBanner from '@/components/LiveBanner'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import { deckDates } from '@/generated/deck-dates'
import { BouncingSprite } from '@/components/BouncingSprite'

// Force static generation at build time
export const dynamic = 'force-static'

function getPokemonSprite(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexId}.png`
}

type DeckFormat = 'Standard' | 'Post-Rotation'

interface Deck {
  id: string
  title: string
  pokemon: number[]
  tier: number
  format: DeckFormat
}

type Locale = 'en' | 'es'

function getAllDecks(locale: Locale): Deck[] {
  // Try locale-specific directory first (for Spanish: content/decks/es)
  // Fall back to English decks if locale directory doesn't exist or is empty
  let decksDirectory = path.join(process.cwd(), 'content', 'decks')

  if (locale === 'es') {
    const esDirectory = path.join(process.cwd(), 'content', 'decks', 'es')
    if (fs.existsSync(esDirectory)) {
      const esFiles = fs.readdirSync(esDirectory).filter(f => f.endsWith('.md'))
      if (esFiles.length > 0) {
        decksDirectory = esDirectory
      }
    }
    // If no Spanish decks, fall back to English (decksDirectory stays as default)
  }

  const filenames = fs.readdirSync(decksDirectory)

  const decks = filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const filePath = path.join(decksDirectory, filename)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const { data } = matter(fileContent)

      return {
        id: slug,
        title: data.title || slug,
        pokemon: (data.pokemon as number[]) || [],
        tier: (data.tier as number) || 3,
        format: (data.format as DeckFormat) || 'Standard',
      }
    })

  return decks
}

function getDecksByTier(decks: Deck[]): Map<number, Deck[]> {
  const tierMap = new Map<number, Deck[]>()

  decks.forEach((deck) => {
    const tier = deck.tier
    if (!tierMap.has(tier)) {
      tierMap.set(tier, [])
    }
    tierMap.get(tier)!.push(deck)
  })

  return tierMap
}

function getDecksByFormat(decks: Deck[]): Map<DeckFormat, Deck[]> {
  const formatMap = new Map<DeckFormat, Deck[]>()

  decks.forEach((deck) => {
    const format = deck.format
    if (!formatMap.has(format)) {
      formatMap.set(format, [])
    }
    formatMap.get(format)!.push(deck)
  })

  return formatMap
}

const formatOrder: DeckFormat[] = ['Standard', 'Post-Rotation']

const tierLabels: Record<number, string> = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
}

const tierColors: Record<number, string> = {
  1: 'bg-amber-100 text-amber-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  2: 'bg-slate-200 text-slate-700 dark:bg-slate-600/50 dark:text-slate-200',
  3: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
}

function DeckCard({ deck }: { deck: Deck }) {
  const lastEdited = deckDates[deck.id] || null
  return (
    <Link
      href={`/decks/${deck.id}`}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500 transition-all duration-300 p-6 overflow-hidden"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 transition-all duration-500 rounded-2xl" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {deck.title}
          </h3>
          <div className="flex -space-x-2">
            {deck.pokemon.map((id) => (
              <BouncingSprite
                key={id}
                src={getPokemonSprite(id)}
                size={40}
                className="w-10 h-10"
              />
            ))}
          </div>
        </div>
        <span className="shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-slate-700 flex items-center justify-center">
          <svg className="w-4 h-4 text-stone-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
      {lastEdited && (
        <p className="relative text-sm text-stone-400 dark:text-slate-500 mt-3">
          <LocalDate timestamp={lastEdited} prefixKey="home.updated" />
        </p>
      )}
    </Link>
  )
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const decks = getAllDecks(locale as Locale)
  const decksByFormat = getDecksByFormat(decks)

  const tierLabelsTranslated: Record<number, string> = {
    1: t('tier1'),
    2: t('tier2'),
    3: t('tier3'),
  }

  const formatLabelsTranslated: Record<DeckFormat, string> = {
    'Standard': t('formatStandard'),
    'Post-Rotation': t('formatPostRotation'),
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-slate-900 dark:to-slate-800 relative">
      {/* Announcements */}
      <AnnouncementBanner />

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-stone-200 dark:border-slate-700">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/8 via-purple-400/8 to-violet-500/8 dark:from-violet-600/20 dark:via-purple-500/20 dark:to-violet-600/20 animate-gradient" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern" />

        {/* Decorative floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300/15 dark:bg-violet-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-300/15 dark:bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 dark:from-violet-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent mb-6 animate-gradient bg-[length:200%_auto]">
              {t('title')}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t.rich('subtitle', {
                author: (chunks) => <span className="font-semibold text-violet-600 dark:text-violet-400">{chunks}</span>
              })}
            </p>

            {/* Decorative divider */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-violet-300 dark:to-violet-500" />
              <div className="w-2 h-2 rounded-full bg-violet-400 dark:bg-violet-500 pulse-subtle" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-violet-300 dark:to-violet-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Decks Section */}
      <div id="decks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative scroll-mt-16">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/20 rounded-full blur-3xl -z-10" />

        <h2 className="text-3xl font-bold text-neutral-800 dark:text-slate-100 mb-10">
          {t('decksTitle')}
        </h2>

        <div className="space-y-16">
          {formatOrder.map((format) => {
            const formatDecks = decksByFormat.get(format)
            if (!formatDecks || formatDecks.length === 0) return null

            const decksByTier = getDecksByTier(formatDecks)
            const sortedTiers = Array.from(decksByTier.keys()).sort((a, b) => a - b)

            return (
              <div key={format}>
                {/* Format Header */}
                <div className="mb-8">
                  <h3 className="text-2xl font-medium text-neutral-800 dark:text-slate-100">
                    {formatLabelsTranslated[format]}
                  </h3>
                </div>

                <div className="space-y-12">
                  {sortedTiers.map((tier) => (
                    <div key={tier}>
                      <div className="flex items-center gap-3 mb-6">
                        <span className={`${tierColors[tier]} text-sm font-medium px-3 py-1 rounded-lg`}>
                          {tierLabelsTranslated[tier]}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-stone-200 dark:from-slate-700 to-transparent" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {decksByTier.get(tier)!.map((deck) => (
                          <DeckCard key={deck.id} deck={deck} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <LiveBanner channel="tricroar" />
      </div>

    </main>
  )
}
