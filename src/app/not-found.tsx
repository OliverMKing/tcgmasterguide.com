import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-slate-900 dark:to-slate-800 relative">
      {/* Decorative floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300/15 dark:bg-violet-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-300/15 dark:bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40 relative">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 dark:from-violet-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            404
          </h1>
          <h2 className="mt-6 text-3xl font-bold text-neutral-800 dark:text-slate-100">
            Nothing here!
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-slate-300 max-w-md leading-relaxed">
            Looks like this page wandered off. Let&apos;s get you back on track.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
