'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'link' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white active:scale-[0.98]',
  secondary:
    'bg-white dark:bg-slate-800 text-neutral-800 dark:text-slate-100 border border-stone-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 active:scale-[0.98]',
  ghost:
    'text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 active:scale-[0.98]',
  link: 'text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 underline-offset-4 hover:underline px-0 py-0',
  danger:
    'bg-red-500 hover:bg-red-600 text-white active:scale-[0.98]',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-base px-6 py-3',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    disabled,
    children,
    ...rest
  },
  ref
) {
  const linkPadding = variant === 'link' ? '' : sizes[size]
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${linkPadding} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && (
        <svg
          className="w-4 h-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="3"
          />
          <path
            d="M22 12a10 10 0 0 1-10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
})
