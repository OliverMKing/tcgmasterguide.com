export default function DeckLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header Skeleton */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header Skeleton */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="flex -space-x-2">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </header>

        {/* Table of Contents Skeleton */}
        <nav className="mb-12 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-4" />
            <div className="h-4 w-44 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-4" />
            <div className="h-4 w-52 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-4" />
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-4" />
            <div className="h-4 w-50 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-44 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-4" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-4" />
            <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-4" />
          </div>
        </nav>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-8" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
      </article>
    </main>
  )
}
