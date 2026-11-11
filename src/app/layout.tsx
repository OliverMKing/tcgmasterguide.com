import type { Metadata } from 'next'
import { Big_Shoulders, Atkinson_Hyperlegible_Next } from 'next/font/google'
import '../styles/globals.css'

// Display face: athletic-signage condensed sans for headlines, tier numerals and card names.
const shoulders = Big_Shoulders({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-shoulders',
  axes: ['opsz'],
  display: 'swap',
})

// Text face: built for legibility, which matters most in long, bullet-dense guides.
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-atkinson',
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
    // SVG first (it adapts to light and dark browser themes), PNG for browsers without SVG favicons.
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: { url: '/apple-icon.png', sizes: '180x180' },
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
    <html suppressHydrationWarning className={`${shoulders.variable} ${atkinson.variable}`}>
      <head>
        {/* Apply the saved theme before first paint to avoid a light-mode flash
            and to theme boundaries (e.g. the root 404) that render outside ThemeProvider.
            Mirrors ThemeProvider: dark by default unless the user chose light. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="font-sans bg-page text-ink">
        {children}
      </body>
    </html>
  )
}
