'use client'

import { useEffect, useState } from 'react'

interface LocalDateProps {
  timestamp: string
  prefix?: string
  className?: string
}

export function LocalDate({ timestamp, prefix = '', className }: LocalDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>('')

  useEffect(() => {
    const date = new Date(timestamp)
    setFormattedDate(
      date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    )
  }, [timestamp])

  if (!formattedDate) {
    return null
  }

  return <span className={className}>{prefix}{formattedDate}</span>
}
