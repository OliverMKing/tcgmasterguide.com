import { setRequestLocale, getTranslations } from 'next-intl/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import LiveBanner from '@/components/LiveBanner'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import { DeckCard } from '@/components/DeckCard'
import { Link } from '@/i18n/navigation'
import { getAllPosts } from '@/lib/posts'
import { LocalDate } from '@/components/LocalDate'
import { FreshPostGate } from '@/components/FreshPostGate'
import { isPostFresh } from '@/lib/postFreshness'

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

const tierText: Record<number, string> = {
  1: 'text-tier-1',
  2: 'text-tier-2',
  3: 'text-tier-3',
  4: 'text-tier-4',
}

// The hero shows up to three Tier 1 decks, preferring different lead Pokémon.
function pickHand(decks: Deck[]): Deck[] {
  const tierOne = decks.filter((d) => d.tier === 1)
  const seen = new Set<number>()
  const distinct: Deck[] = []
  const repeats: Deck[] = []
  for (const deck of tierOne) {
    const lead = deck.pokemon[0]
    if (lead !== undefined && !seen.has(lead)) {
      seen.add(lead)
      distinct.push(deck)
    } else {
      repeats.push(deck)
    }
  }
  const hand = [...distinct, ...repeats].slice(0, 3)
  // Put the first pick in the middle of the fan.
  if (hand.length === 3) return [hand[1], hand[0], hand[2]]
  return hand
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
  const newestPost = getAllPosts(locale as Locale)[0]
  // Only feature the newest post while it is under a week and a half old.
  const latestPost = newestPost && isPostFresh(newestPost.date) ? newestPost : undefined

  const tierLabelsTranslated: Record<number, string> = {
    1: t('tier1'),
    2: t('tier2'),
    3: t('tier3'),
    4: t('tier4'),
  }

  const formatLabelsTranslated: Record<DeckFormat, string> = {
    'Standard': t('formatStandard'),
    'Post-Rotation': t('formatPostRotation'),
  }

  const multiFormat = process.env.NEXT_PUBLIC_ENABLE_MULTI_FORMAT === 'true'
  const handDecks = pickHand(decks)

  return (
    <main className="min-h-screen">
      <AnnouncementBanner />

      {/* Hero: the site name and a hand of the current Tier 1 decks */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12 sm:pb-20 overflow-x-clip">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-6 items-center">
          <div>
            <h1 className="font-display font-black text-ink text-[clamp(3.6rem,10vw,7.25rem)] leading-[0.84] tracking-[-0.01em]">
              {t('title')}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-ink-2 leading-relaxed max-w-[34rem]">
              {t.rich('subtitle', {
                author: (chunks) => <strong className="font-bold text-ink">{chunks}</strong>,
              })}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/#decks"
                className="inline-flex items-center rounded-[10px] bg-accent text-accent-ink hover:bg-accent-hover font-semibold px-5 py-3 transition-colors"
              >
                {t('browseDecks')}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-[10px] border border-line-strong hover:border-ink text-ink font-semibold px-5 py-3 transition-colors"
              >
                {t('aboutAuthor')}
              </Link>
            </div>

            {latestPost && (
              <FreshPostGate date={latestPost.date}>
                <Link
                  id="posts"
                  href={`/posts/${latestPost.slug}`}
                  className="group mt-10 flex max-w-[34rem] items-baseline gap-3 border-t border-line pt-4 scroll-mt-16"
                >
                  <span className="shrink-0 text-sm font-bold text-accent-text">{t('latestPost')}</span>
                  <span className="min-w-0 truncate font-semibold text-ink group-hover:underline underline-offset-4">
                    {latestPost.title}
                  </span>
                  {latestPost.date && (
                    <span className="hidden sm:block shrink-0 ml-auto text-sm text-ink-3">
                      <LocalDate timestamp={latestPost.date} format="short" />
                    </span>
                  )}
                </Link>
              </FreshPostGate>
            )}
          </div>

          {handDecks.length > 0 && (
            <div
              aria-hidden="true"
              className="relative h-[270px] sm:h-[360px] [--spread:92px] sm:[--spread:150px]"
            >
              {handDecks.map((deck, i) => {
                const offset = i - (handDecks.length - 1) / 2
                return (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    tier={deck.tier}
                    size="lg"
                    showDate={false}
                    tabIndex={-1}
                    className="deal absolute left-1/2 top-2 w-[160px] sm:w-[220px] -ml-[80px] sm:-ml-[110px]"
                    style={{
                      '--fan-x': `calc(var(--spread) * ${offset})`,
                      '--fan-y': `${Math.abs(offset) * 22}px`,
                      '--fan-rot': `${offset * 9}deg`,
                      '--deal-delay': `${120 + i * 110}ms`,
                      zIndex: i === 1 ? 2 : 1,
                    } as React.CSSProperties}
                  />
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Tier list: a playmat with one printed zone per tier */}
      <section id="decks" aria-labelledby="decks-title" className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 pb-20 scroll-mt-16">
        <div className="playmat rounded-[28px] px-3 py-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-4 px-2 sm:px-0 mb-6 sm:mb-8">
            <h2 id="decks-title" className="font-display font-black text-5xl sm:text-6xl text-mat-ink">
              {t('decksTitle')}
            </h2>
            {!multiFormat && (
              <p className="text-mat-ink-2">{t('deckCount', { count: decks.length })}</p>
            )}
          </div>

          <div className="space-y-12">
            {formatOrder.map((format) => {
              const formatDecks = decksByFormat.get(format)
              if (!formatDecks || formatDecks.length === 0) return null

              const decksByTier = getDecksByTier(formatDecks)
              const sortedTiers = Array.from(decksByTier.keys()).sort((a, b) => a - b)

              return (
                <section key={format} aria-labelledby={multiFormat ? `format-${format}` : undefined}>
                  {multiFormat && (
                    <div className="mb-5 flex items-baseline justify-between gap-3 px-2 sm:px-0">
                      <h3 id={`format-${format}`} className="font-display font-extrabold text-3xl text-mat-ink">
                        {formatLabelsTranslated[format]}
                      </h3>
                      <p className="text-mat-ink-2">{t('deckCount', { count: formatDecks.length })}</p>
                    </div>
                  )}

                  <div className="space-y-4 sm:space-y-5">
                    {sortedTiers.map((tier) => {
                      const tierDecks = decksByTier.get(tier)!
                      // Empty card spots printed on the mat complete the last row (desktop, 5 columns).
                      const emptySlots = (5 - (tierDecks.length % 5)) % 5
                      return (
                        <div
                          key={tier}
                          className="mat-zone grid sm:grid-cols-[3.5rem_minmax(0,1fr)] gap-4 sm:gap-5 p-3 sm:p-5"
                        >
                          <h3
                            className={`font-display font-black text-3xl sm:text-[2.6rem] leading-none ${tierText[tier] ?? 'text-tier-4'} sm:[writing-mode:vertical-rl] sm:rotate-180 sm:self-start sm:justify-self-center px-1 sm:px-0`}
                          >
                            {tierLabelsTranslated[tier]}
                          </h3>
                          {tierDecks.length === 0 ? (
                            <div className="text-mat-ink-2">
                              <p className="font-semibold text-mat-ink">{t('emptyTierTitle')}</p>
                              <p>{t('emptyTierDescription')}</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                              {tierDecks.map((deck) => (
                                <DeckCard key={deck.id} deck={deck} tier={tier} />
                              ))}
                              {Array.from({ length: emptySlots }).map((_, i) => (
                                <div key={`slot-${i}`} aria-hidden="true" className="mat-slot hidden lg:block" />
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
        </div>

        <LiveBanner channel="tricroar" />
      </section>
    </main>
  )
}
