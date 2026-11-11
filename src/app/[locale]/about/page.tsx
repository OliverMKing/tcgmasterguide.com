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

  const link = 'font-semibold text-accent-text underline underline-offset-4 decoration-1 hover:decoration-2'
  const h2 = 'font-display font-extrabold text-ink text-3xl sm:text-4xl leading-none mb-4'

  return (
    <main className="min-h-screen">
      {/* Header: the title, and Grant as a trading card */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12 sm:pb-16 grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-16">
        <div>
          <h1 className="font-display font-black text-ink text-[clamp(3.25rem,8vw,6rem)] leading-[0.85] tracking-[-0.01em]">
            {t('title')}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-ink-2 leading-relaxed max-w-[34rem]">{t('subtitle')}</p>
        </div>

        <figure className="w-[210px] sm:w-[250px] md:mr-6 rotate-2">
          <div className="tcg-card">
            <div className="tcg-card-face">
              <figcaption className="font-display font-extrabold text-card-ink leading-[0.92] px-3.5 pt-3 pb-2.5 text-[1.6rem] sm:text-[1.75rem]">
                Grant Manley
              </figcaption>
              <div className="tcg-card-art flex-1 min-h-0 overflow-hidden">
                <Image
                  src="/images/grant.jpg"
                  alt="Grant Manley"
                  fill
                  sizes="250px"
                  priority
                  className="object-cover"
                />
              </div>
              <p className="px-3.5 py-2.5 text-sm text-card-ink-2 leading-tight">{t('cardCaption')}</p>
            </div>
          </div>
        </figure>
      </header>

      {/* Reading column */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-[68ch] text-lg leading-relaxed text-ink-2 space-y-14 border-t border-line pt-12">
          <section>
            <h2 className={h2}>{t('authorTitle')}</h2>
            <p>
              {t.rich('authorDescription', {
                author: (chunks) => <strong className="font-bold text-ink">{chunks}</strong>,
              })}
            </p>
          </section>

          <section>
            <h2 className={h2}>{t('missionTitle')}</h2>
            <p>
              {t.rich('missionDescription', {
                decksLink: (chunks) => <Link href="/#decks" className={link}>{chunks}</Link>,
              })}
            </p>
          </section>

          <section>
            <h2 className={h2}>{t('offerTitle')}</h2>
            <ul className="list-disc pl-5 space-y-2.5 marker:text-accent">
              <li className="pl-1">
                {t.rich('offer1', {
                  decksLink: (chunks) => <Link href="/#decks" className={link}>{chunks}</Link>,
                })}
              </li>
              <li className="pl-1">{t('offer2')}</li>
              <li className="pl-1">{t('offer3')}</li>
              <li className="pl-1">{t('offer4')}</li>
              <li className="pl-1">{t('offer5')}</li>
              <li className="pl-1">
                {t.rich('offerPosts', {
                  postsLink: (chunks) => <Link href="/posts" className={link}>{chunks}</Link>,
                })}
              </li>
            </ul>
          </section>

          <section>
            <h2 className={h2}>{t('updatesTitle')}</h2>
            <p>{t('updatesDescription')}</p>
            <dl className="mt-6 space-y-5">
              <div className="border-l-2 border-line-strong pl-4">
                <dt className="font-bold text-ink">{t('updatesFeature1Title')}</dt>
                <dd className="mt-1">{t('updatesFeature1')}</dd>
              </div>
              <div className="border-l-2 border-line-strong pl-4">
                <dt className="font-bold text-ink">{t('updatesFeature2Title')}</dt>
                <dd className="mt-1">{t('updatesFeature2')}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className={h2}>{t('qaTitle')}</h2>
            <p>
              {t.rich('qaDescription', {
                qaLink: (chunks) => <Link href="/qa" className={link}>{chunks}</Link>,
              })}
            </p>
          </section>

          <section className="border-t border-line pt-10">
            <h2 className="font-display font-extrabold text-ink text-2xl sm:text-3xl leading-none mb-3">{t('ctaTitle')}</h2>
            <p className="mb-6">{t('ctaDescription')}</p>
            <Link
              href="/#decks"
              className="inline-flex items-center rounded-[10px] border border-line-strong hover:border-ink text-ink font-semibold px-5 py-3 transition-colors"
            >
              {t('ctaButton')}
            </Link>
          </section>
        </div>
      </div>
    </main>
  )
}
