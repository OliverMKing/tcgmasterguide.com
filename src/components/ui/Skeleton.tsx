interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const

export function Skeleton({ className = '', rounded = 'md' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-stone-200/70 dark:bg-slate-700/60 ${roundedMap[rounded]} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
    </div>
  )
}
