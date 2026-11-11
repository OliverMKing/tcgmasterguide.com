import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

// The root 404 renders inside the root layout only: there is no navbar, no
// footer, and no i18n provider. The theme script in the root layout still runs,
// so the tokens match the visitor's theme.
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <Link href="/" className="inline-flex items-center gap-2.5 font-display font-extrabold text-2xl text-ink">
          <LogoMark className="w-7 h-7" />
          TCG Master Guide
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center text-center max-w-md">
          <div aria-hidden="true" className="playmat rounded-[20px] px-10 py-8">
            <div className="mat-slot w-[104px] flex items-center justify-center">
              <span className="font-display font-black text-4xl text-mat-ink-2">404</span>
            </div>
          </div>
          <h1 className="mt-10 font-display font-black text-ink text-5xl sm:text-6xl leading-[0.9]">
            This page isn&apos;t in the deck
          </h1>
          <p className="mt-4 text-lg text-ink-2">The link may be old, or the page may have moved.</p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center rounded-[10px] bg-accent text-accent-ink hover:bg-accent-hover font-semibold px-6 py-3 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
