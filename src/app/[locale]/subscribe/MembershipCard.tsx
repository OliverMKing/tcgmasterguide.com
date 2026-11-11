'use client'

import { useTranslations } from 'next-intl'
import { LogoMark } from '@/components/Logo'
import { useHolo } from '@/hooks/useHolo'

/**
 * The membership as a holo-rare trading card. It is the one bold element on
 * the subscribe pages. The card is decorative: the same facts are in the page text.
 */
export function MembershipCard({ className = '' }: { className?: string }) {
  const t = useTranslations('subscribe')
  const { ref, onPointerMove, onPointerLeave } = useHolo<HTMLDivElement>(12)

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-hidden="true"
      className={`tcg-card holo ${className}`}
    >
      <div className="tcg-card-face">
        <p className="font-display font-extrabold text-card-ink leading-[0.92] px-3.5 pt-3 pb-2.5 text-[1.6rem] sm:text-[1.75rem]">
          {t('monthlyAccess')}
        </p>
        <div className="tcg-card-art flex-1 min-h-0 flex items-center justify-center">
          <LogoMark className="w-[42%] h-auto" />
        </div>
        <div className="px-3.5 pt-3 flex items-baseline gap-2">
          <span className="font-display font-black text-card-ink text-[3.5rem] sm:text-[4rem] leading-[0.85]">
            {t('price')}
          </span>
          <span className="text-card-ink-2 font-semibold">{t('perMonth')}</span>
        </div>
        <p className="px-3.5 pt-2 text-[0.8rem] leading-snug text-card-ink-2">{t('cardText')}</p>
        <p className="px-3.5 pt-2 pb-2.5 text-[0.72rem] text-card-ink-2">TCG Master Guide</p>
      </div>
    </div>
  )
}
