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
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('language')}:</span>
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent text-sm text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 cursor-pointer"
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
