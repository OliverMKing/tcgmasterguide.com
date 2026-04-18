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

const variants: Record<Variant, string> = {
  neutral:
    'bg-stone-100 text-stone-700 dark:bg-slate-700/70 dark:text-slate-200 border border-stone-200/60 dark:border-slate-600/60',
  violet:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200/60 dark:border-violet-700/40',
  gold:
    'bg-amber-100 text-amber-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-amber-200/60 dark:border-yellow-700/40',
  silver:
    'bg-slate-200 text-slate-700 dark:bg-slate-600/60 dark:text-slate-200 border border-slate-300/60 dark:border-slate-500/40',
  bronze:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border border-orange-200/60 dark:border-orange-700/40',
  success:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-700/40',
  warning:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/40',
  danger:
    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200/60 dark:border-red-700/40',
  info:
    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-700/40',
}

const sizes: Record<Size, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
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
      className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {leftIcon}
      {children}
    </span>
  )
}
