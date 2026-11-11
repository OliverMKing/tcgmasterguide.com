'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('footer')

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-ink-3">{t('language')}</span>
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-surface text-sm text-ink border border-line-strong rounded-lg px-2 py-1 cursor-pointer"
        aria-label="Select language"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc === 'en' ? 'English' : 'Español'}
          </option>
        ))}
      </select>
    </div>
  )
}
