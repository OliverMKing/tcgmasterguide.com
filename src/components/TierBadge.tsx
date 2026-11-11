import { Badge } from '@/components/ui'

const tierVariants: Record<number, 'gold' | 'silver' | 'bronze' | 'neutral'> = {
  1: 'gold',
  2: 'silver',
  3: 'bronze',
  4: 'neutral',
}

interface TierBadgeProps {
  tier: number
  label: string
  size?: 'sm' | 'md'
}

// A small dark chip in the tier's metal color: the same colors the tier zones use on the playmat.
export function TierBadge({ tier, label, size = 'md' }: TierBadgeProps) {
  const variant = tierVariants[tier] ?? 'neutral'
  return (
    <Badge
      variant={variant}
      size={size}
      className={variant === 'neutral' ? 'bg-mat text-tier-4' : ''}
      leftIcon={<span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-current" />}
    >
      {label}
    </Badge>
  )
}
