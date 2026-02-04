'use client'

import { useAuth } from '@clerk/nextjs'
import { useCallback } from 'react'

interface FetchWithRetryOptions extends RequestInit {
  forceRefresh?: boolean
}

/**
 * Hook that provides a fetch wrapper handling Clerk JWT expiration.
 * On 401, it forces a token refresh via getToken and retries.
 * Use forceRefresh: true to refresh the token before the initial request.
 */
export function useFetchWithRetry() {
  const { getToken } = useAuth()

  const fetchWithRetry = useCallback(
    async (url: string, options?: FetchWithRetryOptions): Promise<Response> => {
      const { forceRefresh, ...fetchOptions } = options || {}

      // If forceRefresh is requested, get a fresh token upfront
      let requestOptions: RequestInit = fetchOptions
      if (forceRefresh) {
        const token = await getToken({ skipCache: true })
        if (token) {
          requestOptions = {
            ...fetchOptions,
            headers: {
              ...fetchOptions?.headers,
              Authorization: `Bearer ${token}`,
            },
          }
        }
      }

      const response = await fetch(url, requestOptions)

      if (response.status === 401) {
        // Force Clerk to refresh the token
        const token = await getToken({ skipCache: true })

        // Retry the request with the fresh token in Authorization header
        const retryOptions: RequestInit = {
          ...fetchOptions,
          headers: {
            ...fetchOptions?.headers,
            Authorization: `Bearer ${token}`,
          },
        }
        return fetch(url, retryOptions)
      }

      return response
    },
    [getToken]
  )

  return fetchWithRetry
}
