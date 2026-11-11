'use client'

import { useId } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { LogoMark } from '@/components/Logo'

// Our own card back: mat purple, a woven diamond print, an inner printed frame,
// and the brand mark in a card-stock disc. It is not the official Pokémon card back.
function CardBack({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`tcg-card ${className}`} style={style}>
      <div className="relative h-full overflow-hidden rounded-[7px] bg-mat">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--mat-2) 0 2px, transparent 2px 9px), repeating-linear-gradient(-45deg, var(--mat-2) 0 2px, transparent 2px 9px)',
          }}
        />
        <div className="absolute inset-[6px] rounded-[4px] border border-mat-line" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex aspect-square w-[52%] items-center justify-center rounded-full bg-card ring-[3px] ring-mat-2">
            <LogoMark className="w-[72%]" />
          </span>
        </div>
      </div>
    </div>
  )
}

const fan = [
  { rotate: -9, y: 6 },
  { rotate: 0, y: 0 },
  { rotate: 9, y: 6 },
]

/** A small fanned row of face-down cards. Used where guide content is locked. */
export function FaceDownCards({ count = 3, className = '' }: { count?: 2 | 3; className?: string }) {
  const cards = count === 2 ? [fan[0], fan[2]] : fan
  return (
    <div aria-hidden="true" className={`flex items-start pt-1 pb-2 pl-2 pr-3 ${className}`}>
      {cards.map((c, i) => (
        <CardBack
          key={i}
          className={`w-[68px] sm:w-[78px] shrink-0 ${i > 0 ? '-ml-7 sm:-ml-8' : ''}`}
          style={{ transform: `translateY(${c.y}px) rotate(${c.rotate}deg)`, zIndex: i === 1 ? 2 : 1 }}
        />
      ))}
    </div>
  )
}

/** The subscribe button, or the sign-in button for signed-out readers. */
export function LockedActions({ fullWidth = false }: { fullWidth?: boolean }) {
  const t = useTranslations('locked')
  const cls = `inline-flex items-center justify-center rounded-[10px] bg-accent text-accent-ink hover:bg-accent-hover font-semibold text-base px-5 py-3 transition-colors cursor-pointer active:translate-y-px no-underline ${fullWidth ? 'w-full' : ''}`
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className={cls}>{t('signInButton')}</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        {/* Overrides the .guide-prose link color: this is a button, not a text link. */}
        <Link href="/subscribe" className={`${cls} !text-accent-ink !no-underline`}>
          {t('subscribeButton')}
        </Link>
      </SignedIn>
    </>
  )
}

export function LockedSection() {
  const t = useTranslations('locked')
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="my-12 flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-7"
    >
      <FaceDownCards className="shrink-0 self-start sm:self-center" />
      <div className="min-w-0">
        <h3 id={titleId} className="font-display font-black text-[1.875rem] leading-[0.95] text-ink">
          {t('faceDownTitle')}
        </h3>
        <p className="mt-2 max-w-[46ch] text-base leading-relaxed text-ink-2">{t('faceDownBody')}</p>
        <div className="mt-5">
          <LockedActions />
        </div>
      </div>
    </section>
  )
}
