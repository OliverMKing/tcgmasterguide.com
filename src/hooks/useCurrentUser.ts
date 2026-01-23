'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'

interface UserData {
  id: string
  role: string
}

const CACHE_KEY = 'tcg_user_data'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

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
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const prevSignedInRef = useRef<boolean | undefined>(undefined)

  // Clear cache when user signs out or signs in (auth state changes)
  useEffect(() => {
    if (!isLoaded) return

    const wasSignedIn = prevSignedInRef.current
    const nowSignedIn = isSignedIn

    // Detect auth state change (sign in or sign out)
    if (wasSignedIn !== undefined && wasSignedIn !== nowSignedIn) {
      clearUserCache()
    }

    prevSignedInRef.current = nowSignedIn
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    async function fetchUserData() {
      if (!isLoaded || !isSignedIn || !user) {
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
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const data = await res.json()
          setUserData(data)
          setCachedUserData(user.id, data)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [isLoaded, isSignedIn, user])

  return {
    isLoaded: isLoaded && !loading,
    isSignedIn,
    user,
    userData,
    isAdmin: userData?.role === 'ADMIN',
  }
}
