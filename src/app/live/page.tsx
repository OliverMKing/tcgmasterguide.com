import type { Metadata } from 'next'
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

export default function LivePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="border-b border-stone-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-slate-100 mb-3">
              Live Stream
            </h1>
            <p className="text-lg text-neutral-600 dark:text-slate-300 max-w-2xl mx-auto">
              Watch Grant Manley live on Twitch
            </p>
          </div>
        </div>
      </div>

      <LivePageContent channel="tricroar" />
    </main>
  )
}
