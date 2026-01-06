import Link from 'next/link'
import Image from 'next/image'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { LocalDate } from '@/components/LocalDate'

// Force static generation at build time
export const dynamic = 'force-static'

function getPokemonSprite(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexId}.png`
}

interface Deck {
  id: string
  title: string
  lastEdited: string | null
  pokemon: number[]
  tier: number
}

function getAllDecks(): Deck[] {
  const decksDirectory = path.join(process.cwd(), 'content', 'decks')
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
        lastEdited: data.lastEdited || null,
        pokemon: (data.pokemon as number[]) || [],
        tier: (data.tier as number) || 3,
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

const tierLabels: Record<number, string> = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
}

const tierColors: Record<number, string> = {
  1: 'bg-yellow-500',
  2: 'bg-slate-400',
  3: 'bg-amber-700',
}

function DeckCard({ deck }: { deck: Deck }) {
  return (
    <Link
      href={`/decks/${deck.id}`}
      className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl hover:shadow-purple-100/50 dark:hover:shadow-purple-900/30 transition-all duration-300 p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
            {deck.title}
          </h3>
          <div className="flex -space-x-2">
            {deck.pokemon.map((id) => (
              <Image
                key={id}
                src={getPokemonSprite(id)}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                unoptimized
              />
            ))}
          </div>
        </div>
        <span className="shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
      {deck.lastEdited && (
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-3">
          <LocalDate timestamp={deck.lastEdited} prefix="Updated " />
        </p>
      )}
    </Link>
  )
}

export default function Home() {
  const decks = getAllDecks()
  const decksByTier = getDecksByTier(decks)
  const sortedTiers = Array.from(decksByTier.keys()).sort((a, b) => a - b)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-fuchsia-600/10 dark:from-purple-600/20 dark:to-fuchsia-600/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-700 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent mb-6">
              TCG Master Guide
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              In-depth Pokemon Trading Card Game deck guides by Grant Manley, former world #1 ranked player. Constantly updated to keep you ahead of the meta.
            </p>
          </div>
        </div>
      </div>

      {/* Decks Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 id="decks" className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Decks
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent ml-8" />
        </div>

        <div className="space-y-12">
          {sortedTiers.map((tier) => (
            <div key={tier}>
              <div className="flex items-center gap-3 mb-6">
                <span className={`${tierColors[tier]} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                  {tierLabels[tier]}
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {decksByTier.get(tier)!.map((deck) => (
                  <DeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}
