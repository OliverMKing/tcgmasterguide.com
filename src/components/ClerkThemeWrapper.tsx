'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { esES } from '@clerk/localizations'
import { useTheme } from './ThemeProvider'

interface ClerkThemeWrapperProps {
  children: React.ReactNode
  locale?: string
}

export function ClerkThemeWrapper({ children, locale }: ClerkThemeWrapperProps) {
  const { theme } = useTheme()

  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
      }}
      localization={locale === 'es' ? esES : undefined}
    >
      {children}
    </ClerkProvider>
  )
}
