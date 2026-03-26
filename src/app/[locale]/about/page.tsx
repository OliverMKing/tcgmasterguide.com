import { Link } from '@/i18n/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
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

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('about')

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="border-b border-stone-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-slate-100 mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('subtitle')}
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
                {t('authorTitle')}
              </h2>
              <p className="text-neutral-600 dark:text-slate-300 leading-relaxed">
                {t.rich('authorDescription', {
                  author: (chunks) => <span className="font-semibold text-violet-600 dark:text-violet-400">{chunks}</span>
                })}
              </p>
            </div>
          </div>

          {/* Our Mission */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-3">
              {t('missionTitle')}
            </h2>
            <p className="text-neutral-600 dark:text-slate-300 leading-relaxed">
              {t('missionDescription')}
            </p>
          </div>

          {/* What We Offer */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-4">
              {t('offerTitle')}
            </h2>
            <ul className="space-y-3 text-neutral-600 dark:text-slate-300">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('offer1')}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('offer2')}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('offer3')}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('offer4')}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('offer5')}</span>
              </li>
            </ul>
          </div>

          {/* Always Up to Date */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-3">
              {t('updatesTitle')}
            </h2>
            <p className="text-neutral-600 dark:text-slate-300 leading-relaxed mb-4">
              {t('updatesDescription')}
            </p>
            <ul className="space-y-3 text-neutral-600 dark:text-slate-300">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span><span className="font-semibold">{t('updatesFeature1Title')}</span> — {t('updatesFeature1')}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mr-3 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span><span className="font-semibold">{t('updatesFeature2Title')}</span> — {t('updatesFeature2')}</span>
              </li>
            </ul>
          </div>

          {/* Q&A */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-3">
              {t('qaTitle')}
            </h2>
            <p className="text-neutral-600 dark:text-slate-300 leading-relaxed">
              {t.rich('qaDescription', {
                qaLink: (chunks) => <Link href="/qa" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">{chunks}</Link>
              })}
            </p>
          </div>

          {/* CTA */}
          <div className="text-center pt-6 border-t border-stone-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-slate-100 mb-2">
              {t('ctaTitle')}
            </h2>
            <p className="text-neutral-600 dark:text-slate-300 mb-5">
              {t('ctaDescription')}
            </p>
            <Link
              href="/#decks"
              className="inline-block px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors"
            >
              {t('ctaButton')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
