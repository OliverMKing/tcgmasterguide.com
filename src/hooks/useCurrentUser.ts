'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { hasSubscriberAccess as checkSubscriberAccess } from '@/lib/user-roles'

interface UserData {
  id: string
  role: string
}

const CACHE_KEY = 'tcg_user_data'
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

// Retry configuration for handling race conditions with Clerk webhook
const MAX_RETRIES = 5
const INITIAL_RETRY_DELAY = 500 // ms

interface CachedUserData {
  data: UserData
  userId: string
  timestamp: number
}

function getCachedUserData(userId: string): UserData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const parsed: CachedUserData = JSON.parse(cached)
    if (parsed.userId !== userId) return null
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null

    return parsed.data
  } catch {
    return null
  }
}

function setCachedUserData(userId: string, data: UserData): void {
  try {
    const cached: CachedUserData = {
      data,
      userId,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch {
    // localStorage might be unavailable
  }
}

export function clearUserCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // localStorage might be unavailable
  }
}

export function useCurrentUser() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const prevUserIdRef = useRef<string | null | undefined>(undefined)

  // Create a fetch function that includes the session token in the Authorization header
  // This ensures the API receives the current token even after a refresh
  const fetchWithToken = useCallback(async (skipCache = false): Promise<Response> => {
    const token = await getToken({ skipCache })
    return fetch('/api/user/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  }, [getToken])

  useEffect(() => {
    async function fetchUserData() {
      if (!isLoaded) return

      const currentUserId = isSignedIn && user ? user.id : null
      const prevUserId = prevUserIdRef.current

      // Detect user change (sign out, sign in, or switch user)
      if (prevUserId !== undefined && prevUserId !== currentUserId) {
        clearUserCache()
        setUserData(null)
      }

      prevUserIdRef.current = currentUserId

      if (!isSignedIn || !user) {
        setUserData(null)
        setLoading(false)
        return
      }

      // Check cache first
      const cached = getCachedUserData(user.id)
      if (cached) {
        setUserData(cached)
        setLoading(false)
        return
      }

      try {
        let res: Response | null = null
        let lastError: Error | null = null

        // Retry loop with exponential backoff for race conditions
        // (webhook hasn't created user yet)
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            // First attempt: use cached token for speed
            // On 401: force token refresh and retry
            const skipCache = attempt > 0
            res = await fetchWithToken(skipCache)

            // Success - break out of retry loop
            if (res.ok) {
              break
            }

            // 401 or 404 with retries left: wait and retry
            // 401: session token expired/invalid
            // 404: webhook race condition (user not in DB yet)
            if ([401, 404].includes(res.status) && attempt < MAX_RETRIES - 1) {
              const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
              await new Promise(resolve => setTimeout(resolve, delay))
              continue
            }

            // Non-retryable error or out of retries
            break
          } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error')
            // Network error - retry if we have attempts left
            if (attempt < MAX_RETRIES - 1) {
              const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
              await new Promise(resolve => setTimeout(resolve, delay))
              continue
            }
          }
        }

        if (res?.ok) {
          const data = await res.json()
          setUserData(data)
          setCachedUserData(user.id, data)
        } else {
          // User not found in DB or other error after all retries
          if (lastError) {
            console.error('Failed to fetch user data:', lastError)
          }
          setUserData(null)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        setUserData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [isLoaded, isSignedIn, user, fetchWithToken])

  const isAdmin = userData?.role === 'ADMIN'

  return {
    isLoaded: isLoaded && !loading,
    isSignedIn,
    user,
    userData,
    isAdmin,
    hasSubscriberAccess: checkSubscriberAccess(userData?.role),
  }
}
