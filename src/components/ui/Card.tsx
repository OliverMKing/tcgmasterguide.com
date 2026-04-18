import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section'
  interactive?: boolean
  children?: ReactNode
}

export function Card({
  as: Tag = 'div',
  interactive = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  const base =
    'bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 shadow-sm'
  const hover = interactive
    ? 'transition-all duration-300 ease-out hover:border-violet-300 dark:hover:border-violet-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10 dark:hover:shadow-violet-900/30'
    : ''
  return (
    <Tag className={`${base} ${hover} ${className}`} {...(rest as object)}>
      {children}
    </Tag>
  )
}
