'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { BouncingSprite } from '@/components/BouncingSprite'
import { LocalDate } from '@/components/LocalDate'
import { deckDates } from '@/generated/deck-dates'

interface Deck {
  id: string
  title: string
  pokemon: number[]
}

function getPokemonSprite(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexId}.png`
}

export function DeckCard({ deck }: { deck: Deck }) {
  const lastEdited = deckDates[deck.id] || null
  const [bounceKey, setBounceKey] = useState(0)

  return (
    <Link
      href={`/decks/${deck.id}`}
      onMouseEnter={() => setBounceKey((k) => k + 1)}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 shadow-card hover:shadow-card-hover hover:border-violet-300 dark:hover:border-violet-500 transition-all duration-300 ease-snappy p-6 overflow-hidden flex flex-col h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 transition-all duration-500 rounded-2xl" />

      <div className="relative flex items-center justify-between gap-3 flex-1">
        <div className="flex items-center gap-3 min-w-0 flex-wrap lg:flex-nowrap">
          <h3 className="text-lg font-medium text-neutral-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors break-words">
            {deck.title}
          </h3>
          <div className="flex -space-x-2 shrink-0">
            {deck.pokemon.map((id) => (
              <BouncingSprite
                key={id}
                src={getPokemonSprite(id)}
                size={40}
                className="w-10 h-10"
                bounceKey={bounceKey}
              />
            ))}
          </div>
        </div>
        <span className="shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40 group-hover:translate-x-0.5 transition-all duration-300">
          <svg className="w-4 h-4 text-stone-400 dark:text-slate-400 group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
      {lastEdited && (
        <p className="relative text-xs text-stone-400 dark:text-slate-500 mt-auto pt-3 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
          </svg>
          <LocalDate timestamp={lastEdited} prefixKey="home.updated" />
        </p>
      )}
    </Link>
  )
}
