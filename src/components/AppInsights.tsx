'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

let appInsights: ApplicationInsights | null = null

function getAppInsights(): ApplicationInsights | null {
  if (typeof window === 'undefined') return null

  const connectionString = process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING
  if (!connectionString) return null

  if (!appInsights) {
    appInsights = new ApplicationInsights({
      config: {
        connectionString,
        enableAutoRouteTracking: false, // We'll track manually for more control
        disableFetchTracking: true,
        disableAjaxTracking: true,
        disableExceptionTracking: true,
      },
    })
    appInsights.loadAppInsights()
  }

  return appInsights
}

export function AppInsightsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const ai = getAppInsights()
    if (ai && pathname) {
      // Only track deck pages
      if (pathname.startsWith('/decks/')) {
        ai.trackPageView({
          name: pathname,
          uri: pathname,
        })
      }
    }
  }, [pathname])

  return <>{children}</>
}
