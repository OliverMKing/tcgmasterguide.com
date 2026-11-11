'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { esES } from '@clerk/localizations'
import { useTheme } from './ThemeProvider'

interface ClerkThemeWrapperProps {
  children: React.ReactNode
  locale?: string
}

// Clerk needs concrete colors, so these mirror the Playmat tokens in
// src/styles/globals.css (:root for light, .dark for dark). Keep them in sync.
const fontFamily = 'var(--font-atkinson), system-ui, sans-serif'
const fontSize = '0.9375rem'

const lightVariables = {
  colorPrimary: '#b8246f', // --accent
  colorPrimaryForeground: '#ffffff', // --accent-ink
  colorBackground: '#ffffff', // --surface
  colorForeground: '#1e1828', // --ink
  colorMutedForeground: '#4e465c', // --ink-2
  colorMuted: '#e9e6ef', // --surface-2
  colorNeutral: '#1e1828', // --ink
  colorInput: '#ffffff', // --surface
  colorInputForeground: '#1e1828', // --ink
  colorBorder: '#c3bccf', // --line-strong
  colorRing: '#b8246f', // --accent
  colorDanger: '#b42318', // --bad
  colorSuccess: '#1f7a4d', // --ok
  colorWarning: '#8a5a00', // --warn
  colorModalBackdrop: 'rgb(30 24 40 / 0.55)',
  borderRadius: '10px',
  fontFamily,
  fontSize,
}

const darkVariables = {
  colorPrimary: '#ff6fb0',
  colorPrimaryForeground: '#2a0717',
  colorBackground: '#1d1729',
  colorForeground: '#eeeaf4',
  colorMutedForeground: '#b9b0c8',
  colorMuted: '#272035',
  colorNeutral: '#eeeaf4',
  colorInput: '#15101e', // --page, so inputs read as inset on the surface
  colorInputForeground: '#eeeaf4',
  colorBorder: '#463c5c',
  colorRing: '#ff6fb0',
  colorDanger: '#ff8a80',
  colorSuccess: '#5fd39a',
  colorWarning: '#f2c35b',
  colorModalBackdrop: 'rgb(8 5 14 / 0.7)',
  borderRadius: '10px',
  fontFamily,
  fontSize,
}

export function ClerkThemeWrapper({ children, locale }: ClerkThemeWrapperProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: isDark ? darkVariables : lightVariables,
      }}
      localization={locale === 'es' ? esES : undefined}
    >
      {children}
    </ClerkProvider>
  )
}
