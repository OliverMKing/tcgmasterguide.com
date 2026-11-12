'use client'

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { LocalDate } from '@/components/LocalDate'
import { deckDates } from '@/generated/deck-dates'
import { useHolo } from '@/hooks/useHolo'

interface Deck {
  id: string
  title: string
  pokemon: number[]
}

export function getPokemonSprite(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexId}.png`
}

// Sprite width as a share of the art window, per number of Pokémon. PokeAPI sprites
// have wide transparent margins, so sprites overlap to read as one group.
const spriteLayout: { width: number; overlap: number }[] = [
  { width: 96, overlap: 0 },
  { width: 66, overlap: 22 },
  { width: 52, overlap: 18 },
]

interface DeckCardProps {
  deck: Deck
  /** Every deck card is a holo. Set false for a plain card. */
  holo?: boolean
  /** Picks the foil metal: 1 gold, 2 silver, 3 copper, 4 lavender. */
  tier?: number
  size?: 'sm' | 'lg'
  /** Shows the "Updated" line. Off for the hero hand. */
  showDate?: boolean
  className?: string
  style?: React.CSSProperties
  tabIndex?: number
}

export function DeckCard({
  deck,
  holo = true,
  tier,
  size = 'sm',
  showDate = true,
  className = '',
  style,
  tabIndex,
}: DeckCardProps) {
  const lastEdited = deckDates[deck.id] || null
  const { ref, onPointerMove, onPointerLeave } = useHolo<HTMLDivElement>(holo ? 12 : 0)
  const count = Math.min(deck.pokemon.length, 3) || 1
  const layout = spriteLayout[count - 1]
  const [first, ...rest] = deck.title.split(' / ')

  return (
    <Link
      href={`/decks/${deck.id}`}
      className={`group block rounded-[12px] ${className}`}
      style={style}
      tabIndex={tabIndex}
    >
      <div
        ref={ref}
        onPointerMove={holo ? onPointerMove : undefined}
        onPointerLeave={holo ? onPointerLeave : undefined}
        className={`tcg-card ${holo ? `holo ${tier ? `foil-tier-${tier}` : ''}` : ''}`}
      >
        <div className="tcg-card-face">
          <h3
            className={`font-display font-extrabold text-card-ink leading-[0.92] ${
              size === 'lg' ? 'px-3.5 pt-3 pb-2.5 text-[1.75rem]' : 'px-2.5 pt-2 pb-1.5 text-[1.3rem]'
            }`}
          >
            {first}
            {rest.length > 0 && (
              <span className="block text-card-ink-2 whitespace-nowrap">/ {rest.join(' / ')}</span>
            )}
          </h3>
          <div className="tcg-card-art flex-1 flex items-center justify-center overflow-hidden">
            {deck.pokemon.slice(0, 3).map((id, i) => (
              <Image
                key={id}
                src={getPokemonSprite(id)}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="sprite shrink-0 h-auto max-w-none object-contain"
                style={{ width: `${layout.width}%`, marginLeft: i === 0 ? 0 : `-${layout.overlap}%` }}
              />
            ))}
          </div>
          <div
            className={`text-card-ink-2 ${size === 'lg' ? 'px-3.5 py-2.5 text-sm' : 'px-2.5 py-2 text-[0.72rem] sm:text-[0.78rem]'} leading-tight whitespace-nowrap overflow-hidden text-ellipsis`}
          >
            {/* The date is formatted in the browser, so the server sends an empty footer.
                A non-breaking space holds one line of text until then, so the footer keeps
                its height and the art window above it does not resize. */}
            {showDate && lastEdited ? (
              <LocalDate timestamp={lastEdited} prefixKey="home.updated" format="short" placeholder={'\u00a0'} />
            ) : (
              '\u00a0'
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
