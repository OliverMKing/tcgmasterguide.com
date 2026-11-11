import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section'
  interactive?: boolean
  children?: ReactNode
}

// A plain panel on the page. Not a trading card: use .tcg-card for those.
export function Card({
  as: Tag = 'div',
  interactive = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  const base = 'bg-surface rounded-2xl border border-line'
  const hover = interactive ? 'transition-colors duration-200 hover:border-ink-3' : ''
  return (
    <Tag className={`${base} ${hover} ${className}`} {...(rest as object)}>
      {children}
    </Tag>
  )
}
