export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-fuchsia-600/10 dark:from-purple-600/20 dark:to-fuchsia-600/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-700 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent mb-6">
              TCG Master Guide
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              In-depth Pokémon TCG deck guides by Grant Manley, former world #1 ranked player. Constantly updated to keep you ahead of the meta.
            </p>
          </div>
        </div>
      </div>

      {/* Decks Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 id="decks" className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Decks
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent ml-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-3" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
