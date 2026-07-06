import { Badge } from '@/components/ui'

const tierVariants: Record<number, 'gold' | 'silver' | 'bronze' | 'neutral'> = {
  1: 'gold',
  2: 'silver',
  3: 'bronze',
  4: 'neutral',
}

function TierIcon({ tier }: { tier: number }) {
  if (tier === 1) {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5 4l4 4 3-6 3 6 4-4-1 12H6L5 4zm1 14h12v2H6v-2z" />
      </svg>
    )
  }
  if (tier === 2) {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 -2.31 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2.39 4.84L20 8l-4 3.9.94 5.48L12 14.77l-4.94 2.6L8 11.9 4 8l5.61-1.16L12 2z" />
      </svg>
    )
  }
  if (tier === 3) {
    return (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l8 7-8 13-8-13 8-7zm0 3.2L6.2 10 12 19.3 17.8 10 12 5.2z" />
      </svg>
    )
  }
  return (
    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7l8 8 8-8v4l-8 8-8-8z" />
    </svg>
  )
}

interface TierBadgeProps {
  tier: number
  label: string
  size?: 'sm' | 'md'
}

export function TierBadge({ tier, label, size = 'md' }: TierBadgeProps) {
  return (
    <Badge variant={tierVariants[tier] ?? 'neutral'} size={size} leftIcon={<TierIcon tier={tier} />}>
      {label}
    </Badge>
  )
}
