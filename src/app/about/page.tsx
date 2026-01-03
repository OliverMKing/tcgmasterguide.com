import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-fuchsia-600/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-700 to-fuchsia-600 bg-clip-text text-transparent mb-6">
              About TCG Master Guide
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Expert deck guides from one of the most accomplished players in competitive Pokemon TCG.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* About the Author */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              About the Author
            </h2>
            <p className="text-slate-600 leading-relaxed">
              TCG Master Guide is written by Grant Manley, an elite competitive Pokemon TCG player who has
              been ranked #1 in the world. Known for his consistent top finishes and deep understanding
              of the game, Grant is one of the most accomplished players in the competitive scene.
            </p>
          </div>

          {/* Our Mission */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Our Mission
            </h2>
            <p className="text-slate-600 leading-relaxed">
              TCG Master Guide provides in-depth deck guides for Pokemon Trading Card Game players
              of all skill levels. Our guides are constantly updated to reflect the latest meta shifts,
              new card releases, and competitive strategies. Whether you're just starting out or
              competing at the highest levels, our deck guides give you the insights you need to
              succeed.
            </p>
          </div>

          {/* What We Offer */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              What We Offer
            </h2>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start">
                <span className="shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Detailed deck guides with card breakdowns and strategy tips</span>
              </li>
              <li className="flex items-start">
                <span className="shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Regularly updated content reflecting the current meta</span>
              </li>
              <li className="flex items-start">
                <span className="shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Guides for both beginners and competitive players</span>
              </li>
              <li className="flex items-start">
                <span className="shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Matchup analysis and tech card recommendations</span>
              </li>
            </ul>
          </div>

          {/* Always Up to Date */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Always Up to Date
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Grant continuously updates these deck guides as the meta evolves,
              new sets release, and strategies develop. Check back regularly to stay
              ahead of the competition!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTIgMC00IDItNCAyczIgMiA0IDJjMiAwIDQtMiA0LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to level up your game?
            </h2>
            <p className="text-lg text-purple-100 mb-8 max-w-xl mx-auto">
              Explore our deck guides and master the strategies you need to win
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-white text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-colors shadow-lg shadow-purple-900/20"
            >
              View Deck Guides
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
