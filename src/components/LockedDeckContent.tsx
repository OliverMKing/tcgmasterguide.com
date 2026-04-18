import { Link } from '@/i18n/navigation'
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
  const previewHeadings = headings.slice(0, 5)

  return (
    <div className="prose prose-slate prose-lg max-w-none dark:prose-invert">
      {/* Blurred preview teaser */}
      <div className="relative">
        <div className="blur-sm select-none pointer-events-none opacity-50" aria-hidden="true">
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
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            Every matchup, every tech card, every sequencing decision — laid out in detail so you walk into your next tournament prepared.
          </p>
        </div>

        {/* Overlay with subscribe CTA */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-white/85 to-white dark:via-slate-900/85 dark:to-slate-900 rounded-2xl">
          <div className="relative overflow-hidden bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-800/60 rounded-2xl p-8 shadow-2xl shadow-violet-500/10 max-w-md w-full text-center">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-violet-300/30 dark:bg-violet-500/20 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Unlock the full guide
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-5 text-sm leading-relaxed">
                Full strategy, every matchup, video breakdowns, and tech-card notes — updated as the meta shifts.
              </p>
              <ul className="text-left space-y-2 mb-6 max-w-xs mx-auto">
                {[
                  'In-depth gameplay & sequencing',
                  'Complete matchup analysis',
                  '120+ gameplay videos',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <svg className="w-4 h-4 mt-0.5 text-violet-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200 ease-snappy active:scale-[0.98] cursor-pointer">
                    Sign in to subscribe
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/subscribe"
                  className="block w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200 ease-snappy active:scale-[0.98]"
                >
                  Subscribe now
                </Link>
              </SignedIn>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">Cancel anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table of contents preview */}
      {previewHeadings.length > 0 && (
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            What&apos;s inside
          </h4>
          <ul className="space-y-2">
            {(() => {
              const minLevel = previewHeadings.length > 0 ? Math.min(...previewHeadings.map((h) => h.level)) : 1
              return previewHeadings.map((heading) => (
                <li
                  key={heading.id}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-300"
                  style={{ paddingLeft: `${(heading.level - minLevel) * 0.75}rem` }}
                >
                  <svg className="w-4 h-4 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{heading.text}</span>
                </li>
              ))
            })()}
            {headings.length > previewHeadings.length && (
              <li className="text-slate-400 dark:text-slate-500 text-sm pl-6">
                + {headings.length - previewHeadings.length} more sections
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
