import type { Metadata } from 'next'
import { Lexend } from 'next/font/google'
import '../styles/globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ClerkThemeWrapper } from '@/components/ClerkThemeWrapper'
import { AppInsightsProvider } from '@/components/AppInsights'
import { VideoEmbedProvider } from '@/contexts/VideoEmbedContext'
import { ScrollToTop } from '@/components/ScrollToTop'

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
})

const siteUrl = 'https://tcgmasterguide.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TCG Master Guide - Pokemon TCG Deck Guides by Grant Manley',
    template: '%s | TCG Master Guide',
  },
  description:
    'In-depth Pokemon Trading Card Game deck guides by Grant Manley, former world #1 ranked player. Expert strategies, deck lists, and meta analysis updated regularly.',
  keywords: [
    'Pokemon TCG',
    'Pokemon Trading Card Game',
    'deck guides',
    'competitive Pokemon',
    'Grant Manley',
    'Pokemon decks',
    'TCG strategy',
    'Pokemon meta',
  ],
  authors: [{ name: 'Grant Manley' }],
  creator: 'Grant Manley',
  publisher: 'TCG Master Guide',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'TCG Master Guide',
    title: 'TCG Master Guide - Pokemon TCG Deck Guides by Grant Manley',
    description:
      'In-depth Pokemon Trading Card Game deck guides by Grant Manley, former world #1 ranked player. Expert strategies and meta analysis.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TCG Master Guide - Pokemon TCG Deck Guides',
    description:
      'Expert Pokemon TCG deck guides by Grant Manley, former world #1 ranked player.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={lexend.variable}>
      <body className="font-sans bg-stone-50 dark:bg-slate-900 text-neutral-800 dark:text-neutral-100 transition-colors">
        <ThemeProvider>
          <ClerkThemeWrapper>
            <AppInsightsProvider>
              <VideoEmbedProvider>
                <ScrollToTop />
                <Navbar />
                {children}
                <Footer />
              </VideoEmbedProvider>
            </AppInsightsProvider>
          </ClerkThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
