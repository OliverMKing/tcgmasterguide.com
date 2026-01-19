'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from './ThemeProvider'

export function ClerkThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  )
}
