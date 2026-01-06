'use client'

import { useEffect, useState } from 'react'

interface PageViewCountProps {
  slug: string
}

export function PageViewCount({ slug }: PageViewCountProps) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    async function fetchViews() {
      try {
        const response = await fetch(`/api/page-views?slug=${encodeURIComponent(slug)}`)
        if (response.ok) {
          const data = await response.json()
          setViews(data.views)
        }
      } catch (error) {
        console.error('Failed to fetch page views:', error)
      }
    }

    fetchViews()
  }, [slug])

  if (views === null) {
    return (
      <>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </>
    )
  }

  if (views === 0) {
    return null
  }

  return (
    <>
      <span className="text-slate-300 dark:text-slate-600">•</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {views.toLocaleString()} {views === 1 ? 'view' : 'views'}
      </span>
    </>
  )
}
