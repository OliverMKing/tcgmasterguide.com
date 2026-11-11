// Brand mark: two cards, slightly fanned. Inherits size from the parent font-size.
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="11" y="4" width="15" height="21" rx="2.5" transform="rotate(13 18.5 14.5)" className="fill-mat" />
      <rect x="6" y="7" width="15" height="21" rx="2.5" transform="rotate(-7 13.5 17.5)" className="fill-accent" />
      <rect x="9" y="11" width="9" height="8" rx="1" transform="rotate(-7 13.5 17.5)" className="fill-page" opacity="0.85" />
    </svg>
  )
}
