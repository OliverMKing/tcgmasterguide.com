import Link from 'next/link'

export default function SubscribeSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Welcome to Premium!
        </h1>

        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Your subscription is now active. You have full access to all deck guides and premium content.
        </p>

        <Link
          href="/#decks"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-lg shadow-purple-500/25"
        >
          Browse Deck Guides
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </main>
  )
}
