export default function AboutLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-fuchsia-600/10 dark:from-purple-600/20 dark:to-fuchsia-600/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-700 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent mb-6">
              About TCG Master Guide
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Expert deck guides from one of the most accomplished players in competitive Pokemon TCG.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* About the Author Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="w-[120px] h-[120px] rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
              <div className="flex-1 w-full">
                <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4 mx-auto sm:mx-0" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Our Mission Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="h-7 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>

          {/* What We Offer Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="h-7 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse mr-3 shrink-0" />
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Always Up to Date Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="h-7 w-44 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
