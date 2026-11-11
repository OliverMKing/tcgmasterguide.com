import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center text-center max-w-md">
        {/* A small mat with an empty card spot: the page is not in the deck */}
        <div aria-hidden="true" className="playmat rounded-[20px] px-10 py-8">
          <div className="mat-slot w-[104px] flex items-center justify-center">
            <span className="font-display font-black text-4xl text-mat-ink-2">404</span>
          </div>
        </div>
        <h1 className="mt-10 font-display font-black text-ink text-5xl sm:text-6xl leading-[0.9]">{t('title')}</h1>
        <p className="mt-4 text-lg text-ink-2">{t('message')}</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-[10px] bg-accent text-accent-ink hover:bg-accent-hover font-semibold px-6 py-3 transition-colors"
        >
          {t('backHome')}
        </Link>
      </div>
    </main>
  )
}
