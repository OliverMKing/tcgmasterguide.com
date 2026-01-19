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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-fuchsia-600/10 dark:from-purple-600/20 dark:to-fuchsia-600/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-700 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent mb-4">
              Live Stream
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Watch Grant Manley live on Twitch
            </p>
          </div>
        </div>
      </div>

      <LivePageContent channel="tricroar" />
    </main>
  )
}
