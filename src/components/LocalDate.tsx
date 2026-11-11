'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

interface LocalDateProps {
  timestamp: string
  /** Direct prefix string (legacy) */
  prefix?: string
  /** Translation key for prefix (e.g., "home.updated" or "deck.lastUpdated") */
  prefixKey?: string
  className?: string
  /** "long" gives "October 29, 2026"; "short" gives "Oct 29, 2026" */
  format?: 'long' | 'short'
  /** Shown until the date is formatted in the browser (the first render has no date). */
  placeholder?: React.ReactNode
}

export function LocalDate({ timestamp, prefix = '', prefixKey, className, format = 'long', placeholder = null }: LocalDateProps) {
  const locale = useLocale()
  const tHome = useTranslations('home')
  const tDeck = useTranslations('deck')
  const [formattedDate, setFormattedDate] = useState<string>('')

  // Get the translated prefix if prefixKey is provided
  let displayPrefix = prefix
  if (prefixKey === 'home.updated') {
    displayPrefix = tHome('updated') + ' '
  } else if (prefixKey === 'deck.lastUpdated') {
    displayPrefix = tDeck('lastUpdated')
  }

  useEffect(() => {
    const date = new Date(timestamp)
    setFormattedDate(
      date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: format === 'short' ? 'short' : 'long',
        day: 'numeric',
      })
    )
  }, [timestamp, locale, format])

  if (!formattedDate) {
    return <>{placeholder}</>
  }

  return <span className={className}>{displayPrefix}{formattedDate}</span>
}
