import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'

export function LockedSection() {
  return (
    <div className="my-12 relative">
      {/* Blurred teaser content */}
      <div className="blur-sm select-none pointer-events-none opacity-40 mb-8">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Detailed Strategy Guide
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Master the intricacies of this deck with in-depth gameplay tips, optimal sequencing, and advanced techniques used by top players...
        </p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Matchup Analysis
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Learn how to navigate every matchup in the current meta with specific strategies, key cards to watch for, and winning lines of play...
        </p>
      </div>

      {/* Subscribe CTA overlay */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl max-w-lg mx-auto text-center relative -mt-32">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Unlock the Full Guide
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Subscribe to access detailed gameplay strategies, complete matchup breakdowns, video examples, and expert analysis.
        </p>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-lg shadow-purple-500/25 cursor-pointer mb-3">
              Sign In to Subscribe
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <Link
            href="/subscribe"
            className="block w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-lg shadow-purple-500/25 mb-3"
          >
            Subscribe Now
          </Link>
        </SignedIn>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Get unlimited access to all premium guides
        </p>
      </div>
    </div>
  )
}
