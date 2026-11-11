import type { ReactNode } from 'react'

type Variant = 'neutral' | 'violet' | 'gold' | 'silver' | 'bronze' | 'success' | 'warning' | 'danger' | 'info'
type Size = 'sm' | 'md'

interface BadgeProps {
  variant?: Variant
  size?: Size
  className?: string
  leftIcon?: ReactNode
  children: ReactNode
}

// Badges sit on the page, not on the mat. Tier metals use a dark chip so the
// metal color reads the same way it does on the playmat.
const variants: Record<Variant, string> = {
  neutral: 'bg-surface-2 text-ink-2',
  violet: 'bg-accent-soft text-accent-text',
  gold: 'bg-mat text-tier-1',
  silver: 'bg-mat text-tier-2',
  bronze: 'bg-mat text-tier-3',
  success: 'bg-ok-soft text-ok',
  warning: 'bg-warn-soft text-warn',
  danger: 'bg-bad-soft text-bad',
  info: 'bg-surface-2 text-ink',
}

const sizes: Record<Size, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
}

export function Badge({
  variant = 'neutral',
  size = 'sm',
  className = '',
  leftIcon,
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {leftIcon}
      {children}
    </span>
  )
}
