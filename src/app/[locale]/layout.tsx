import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ClerkThemeWrapper } from '@/components/ClerkThemeWrapper'
import { AppInsightsProvider } from '@/components/AppInsights'
import { VideoEmbedProvider } from '@/contexts/VideoEmbedContext'
import { ScrollToTop } from '@/components/ScrollToTop'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as 'en' | 'es')) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <ClerkThemeWrapper locale={locale}>
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
    </NextIntlClientProvider>
  )
}
