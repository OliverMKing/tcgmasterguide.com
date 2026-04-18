import { Link } from '@/i18n/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import LiveBanner from '@/components/LiveBanner'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import { DeckCard } from '@/components/DeckCard'
import { TierBadge } from '@/components/TierBadge'
import { BrowseDecksButton } from '@/components/BrowseDecksButton'
import { Badge, EmptyState } from '@/components/ui'

// Force static generation at build time
export const dynamic = 'force-static'

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

const formatOrder: DeckFormat[] = ['Post-Rotation', 'Standard']

function FormatIcon({ format }: { format: DeckFormat }) {
  if (format === 'Post-Rotation') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M23 4v6h-6M1 20v-6h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
    )
  }
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7z" />
    </svg>
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 dark:from-violet-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent mb-6 animate-gradient bg-[length:200%_auto]">
              {t('title')}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t.rich('subtitle', {
                author: (chunks) => <span className="font-semibold text-violet-600 dark:text-violet-400">{chunks}</span>
              })}
            </p>

            {/* Primary + secondary CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <BrowseDecksButton>
                {t('browseDecks')}
              </BrowseDecksButton>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 text-neutral-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 font-medium px-5 py-3 rounded-xl border border-stone-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:border-violet-300 dark:hover:border-violet-500 backdrop-blur-sm transition-all duration-300 ease-snappy"
              >
                {t('aboutAuthor')}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decks Section */}
      <div id="decks" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative scroll-mt-16">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/20 rounded-full blur-3xl -z-10" />

        <div className="flex items-end justify-between mb-10 gap-4">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-slate-100">
            {t('decksTitle')}
          </h2>
        </div>

        <div className="space-y-16">
          {formatOrder.map((format) => {
            const formatDecks = decksByFormat.get(format)
            if (!formatDecks || formatDecks.length === 0) return null

            const decksByTier = getDecksByTier(formatDecks)
            const sortedTiers = Array.from(decksByTier.keys()).sort((a, b) => a - b)

            return (
              <section key={format} aria-labelledby={`format-${format}`}>
                {/* Format Header — accent bar + icon + count */}
                <div className="mb-8 flex items-center gap-3">
                  <span className="inline-block h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" aria-hidden="true" />
                  {format === 'Post-Rotation' && (
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
                      <FormatIcon format={format} />
                    </span>
                  )}
                  <h3
                    id={`format-${format}`}
                    className="text-2xl font-semibold text-neutral-800 dark:text-slate-100"
                  >
                    {formatLabelsTranslated[format]}
                  </h3>
                  <Badge variant="neutral" size="sm" className="ml-auto">
                    {t('deckCount', { count: formatDecks.length })}
                  </Badge>
                </div>

                <div className="space-y-12">
                  {sortedTiers.map((tier) => {
                    const tierDecks = decksByTier.get(tier)!
                    return (
                      <div key={tier}>
                        <div className="flex items-center gap-3 mb-6">
                          <TierBadge tier={tier} label={tierLabelsTranslated[tier]} />
                          <div className="h-px flex-1 bg-gradient-to-r from-stone-200 dark:from-slate-700 to-transparent" />
                        </div>
                        {tierDecks.length === 0 ? (
                          <EmptyState
                            title={t('emptyTierTitle')}
                            description={t('emptyTierDescription')}
                          />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {tierDecks.map((deck) => (
                              <DeckCard key={deck.id} deck={deck} />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        <LiveBanner channel="tricroar" />
      </div>

    </main>
  )
}
