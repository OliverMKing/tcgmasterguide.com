'use client'

import { useAuth } from '@clerk/nextjs'
import { useCallback } from 'react'

/**
 * Hook that provides a fetch wrapper handling Clerk JWT expiration.
 * On 401, it forces a token refresh via getToken and retries.
 */
export function useFetchWithRetry() {
  const { getToken } = useAuth()

  const fetchWithRetry = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      const response = await fetch(url, options)

      if (response.status === 401) {
        // Force Clerk to refresh the token
        const token = await getToken({ skipCache: true })

        // Retry the request with the fresh token in Authorization header
        const retryOptions: RequestInit = {
          ...options,
          headers: {
            ...options?.headers,
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
