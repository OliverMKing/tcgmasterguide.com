import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about TCG Master Guide and author Grant Manley, former world #1 ranked Pokemon TCG player. Expert deck guides and competitive strategies.',
  openGraph: {
    title: 'About TCG Master Guide',
    description:
      'Learn about TCG Master Guide and author Grant Manley, former world #1 ranked Pokemon TCG player.',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="border-b border-stone-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-slate-100 mb-4">
              About TCG Master Guide
            </h1>
            <p className="text-lg text-neutral-600 dark:text-slate-300 max-w-2xl mx-auto">
              Expert deck guides from one of the most accomplished players in competitive Pokemon TCG.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 p-8 md:p-10">
          {/* About the Author */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-10">
            <Image
              src="/images/grant.jpg"
              alt="Grant Manley"
              width={120}
              height={120}
              priority
              className="rounded-full border-4 border-stone-200 dark:border-slate-600 shrink-0"
            />
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-3 text-center sm:text-left">
                About the Author
              </h2>
              <p className="text-neutral-600 dark:text-slate-300 leading-relaxed">
                TCG Master Guide is written by <span className="font-semibold text-violet-600 dark:text-violet-400">Grant Manley</span>, an elite competitive Pokemon TCG player who has
                been ranked #1 in the world. Known for his consistent top finishes and deep understanding
                of the game, Grant is one of the most accomplished players in the competitive scene.
              </p>
            </div>
          </div>

          {/* Our Mission */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-3">
              Our Mission
            </h2>
            <p className="text-neutral-600 dark:text-slate-300 leading-relaxed">
              TCG Master Guide provides in-depth deck guides for Pokemon Trading Card Game players
              of all skill levels. Our guides are constantly updated to reflect the latest meta shifts,
              new card releases, and competitive strategies. Whether you're just starting out or
              competing at the highest levels, our deck guides give you the insights you need to
              succeed.
            </p>
          </div>

          {/* What We Offer */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-4">
              What We Offer
            </h2>
            <ul className="space-y-3 text-neutral-600 dark:text-slate-300">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Detailed deck guides with in-depth text strategies and video matchup breakdowns</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Regularly updated content reflecting the current meta</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Guides for both beginners and competitive players</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Matchup analysis and tech card recommendations</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Q&A section where you can ask questions and get answers directly from Grant</span>
              </li>
            </ul>
          </div>

          {/* Always Up to Date */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-3">
              Always Up to Date
            </h2>
            <p className="text-neutral-600 dark:text-slate-300 leading-relaxed">
              Grant continuously updates these deck guides as the meta evolves,
              new sets release, and strategies develop. Check back regularly to stay
              ahead of the competition!
            </p>
          </div>

          {/* CTA */}
          <div className="text-center pt-6 border-t border-stone-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-slate-100 mb-2">
              Ready to level up your game?
            </h2>
            <p className="text-neutral-600 dark:text-slate-300 mb-5">
              Explore our deck guides and master the strategies you need to win
            </p>
            <Link
              href="/#decks"
              className="inline-block px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors"
            >
              View Deck Guides
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
