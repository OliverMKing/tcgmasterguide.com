import { NextRequest, NextResponse } from 'next/server'

// Cache the access token and its expiry
let cachedToken: string | null = null
let tokenExpiry: number = 0

// Cache the stream status per channel
const streamStatusCache: Map<string, { isLive: boolean; stream: unknown; expiry: number }> = new Map()
const CACHE_TTL = 60000 // 1 minute

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('Twitch credentials not configured')
    return null
  }

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < tokenExpiry - 300000) {
    return cachedToken
  }

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get access token')
    }

    const data = await response.json()
    cachedToken = data.access_token
    tokenExpiry = Date.now() + data.expires_in * 1000
    return cachedToken
  } catch (error) {
    console.error('Error getting Twitch access token:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')

  if (!channel) {
    return NextResponse.json({ error: 'Channel parameter required' }, { status: 400 })
  }

  // Check cache first
  const cached = streamStatusCache.get(channel.toLowerCase())
  if (cached && Date.now() < cached.expiry) {
    return NextResponse.json({
      isLive: cached.isLive,
      stream: cached.stream,
    })
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const accessToken = await getAccessToken()

  if (!clientId || !accessToken) {
    // Return error if we can't check - client will show embed anyway
    return NextResponse.json({ isLive: false, error: 'Twitch API not configured' })
  }

  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(channel)}`,
      {
        headers: {
          'Client-ID': clientId,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch stream status: ${response.status}`)
    }

    const data = await response.json()
    const isLive = data.data && data.data.length > 0
    const stream = isLive ? data.data[0] : null

    // Cache the result
    streamStatusCache.set(channel.toLowerCase(), {
      isLive,
      stream,
      expiry: Date.now() + CACHE_TTL,
    })

    return NextResponse.json({ isLive, stream })
  } catch (error) {
    console.error('Error checking Twitch stream status:', error)
    return NextResponse.json({ isLive: false, error: 'Failed to check stream status' })
  }
}
