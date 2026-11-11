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
    <div className={`border-[1.5px] border-dashed border-line-strong rounded-2xl px-6 py-10 ${className}`}>
      {icon && <div className="mb-3 text-ink-3">{icon}</div>}
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      {description && <p className="mt-1 text-ink-2 max-w-md">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
