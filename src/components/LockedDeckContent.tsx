import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'

interface TocItem {
  id: string
  text: string
  level: number
}

interface LockedDeckContentProps {
  title: string
  headings: TocItem[]
}

export function LockedDeckContent({ title, headings }: LockedDeckContentProps) {
  // Show only first 3-4 headings as a preview
  const previewHeadings = headings.slice(0, 4)

  return (
    <div className="prose prose-slate prose-lg max-w-none dark:prose-invert">
      {/* Blurred preview teaser */}
      <div className="relative">
        <div className="blur-sm select-none pointer-events-none opacity-50">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            This comprehensive guide covers everything you need to know about playing {title} competitively.
            Learn the optimal card choices, key matchup strategies, and tournament-tested techniques from expert players.
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4">
            Deck Overview
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            Discover the core strategy behind this deck, including the primary win condition, key card synergies, and how to adapt your playstyle based on the current metagame...
          </p>
        </div>

        {/* Overlay with subscribe CTA */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-white/80 to-white dark:via-slate-800/80 dark:to-slate-800">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl max-w-md text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Premium Content
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Subscribe to unlock full deck guides, matchup analysis, and expert strategies.
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
              Get access to all premium guides
            </p>
          </div>
        </div>
      </div>

      {/* Table of contents preview */}
      {previewHeadings.length > 0 && (
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            What&apos;s Inside
          </h4>
          <ul className="space-y-2">
            {previewHeadings.map((heading) => (
              <li
                key={heading.id}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300"
                style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
              >
                <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{heading.text}</span>
              </li>
            ))}
            {headings.length > previewHeadings.length && (
              <li className="text-slate-400 dark:text-slate-500 text-sm pl-6">
                + {headings.length - previewHeadings.length} more sections...
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
