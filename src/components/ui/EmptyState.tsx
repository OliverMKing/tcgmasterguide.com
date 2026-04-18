import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`text-center border border-dashed border-stone-200 dark:border-slate-700 rounded-2xl bg-stone-50/50 dark:bg-slate-800/30 px-6 py-12 ${className}`}
    >
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-800 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-slate-400 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
