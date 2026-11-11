import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import LivePageContent from '@/components/LivePageContent'

export const metadata: Metadata = {
  title: 'Live Stream',
  description:
    'Watch Grant Manley live on Twitch playing Pokemon TCG. Catch live gameplay, deck building, and competitive strategies.',
  openGraph: {
    title: 'Live Stream - TCG Master Guide',
    description:
      'Watch Grant Manley live on Twitch playing Pokemon TCG.',
  },
}

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // The header lives in LivePageContent so it can show the live status.
  return (
    <main className="min-h-screen">
      <LivePageContent channel="tricroar" />
    </main>
  )
}
