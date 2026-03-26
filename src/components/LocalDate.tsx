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
}

export function LocalDate({ timestamp, prefix = '', prefixKey, className }: LocalDateProps) {
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
        month: 'long',
        day: 'numeric',
      })
    )
  }, [timestamp, locale])

  if (!formattedDate) {
    return null
  }

  return <span className={className}>{displayPrefix}{formattedDate}</span>
}
