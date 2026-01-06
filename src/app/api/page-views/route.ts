import { NextRequest, NextResponse } from 'next/server'

// Cache for page view counts (in-memory, resets on cold start)
const viewCountCache = new Map<string, { count: number; timestamp: number }>()
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

// Cache for Azure AD token
let tokenCache: { token: string; expiresAt: number } | null = null

async function getAzureToken(): Promise<string | null> {
  // Return cached token if still valid (with 5 min buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 5 * 60 * 1000) {
    return tokenCache.token
  }

  const clientId = process.env.AZURE_CLIENT_ID
  const clientSecret = process.env.AZURE_CLIENT_SECRET
  const tenantId = process.env.AZURE_TENANT_ID

  if (!clientId || !clientSecret || !tenantId) {
    console.warn('Azure AD credentials not configured')
    return null
  }

  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'https://api.loganalytics.io/.default',
          grant_type: 'client_credentials',
        }),
      }
    )

    if (!response.ok) {
      console.error('Failed to get Azure AD token:', response.status)
      return null
    }

    const data = await response.json()
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    }
    return data.access_token
  } catch (error) {
    console.error('Error getting Azure AD token:', error)
    return null
  }
}

async function queryLogAnalytics(slug: string): Promise<{ count: number; error?: string }> {
  const workspaceId = process.env.AZURE_LOG_ANALYTICS_WORKSPACE_ID

  if (!workspaceId) {
    const msg = 'Log Analytics workspace ID not configured'
    console.warn(msg)
    return { count: 0, error: msg }
  }

  const token = await getAzureToken()
  if (!token) {
    return { count: 0, error: 'Failed to get Azure AD token' }
  }

  const query = `
    AppPageViews
    | where Url endswith "/decks/${slug}"
    | summarize count()
  `

  try {
    const response = await fetch(
      `https://api.loganalytics.io/v1/workspaces/${workspaceId}/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      const msg = `Log Analytics query failed: ${response.status} - ${errorText}`
      console.error(msg)
      return { count: 0, error: msg }
    }

    const data = await response.json()
    // Response format: { tables: [{ rows: [[count]] }] }
    const count = data.tables?.[0]?.rows?.[0]?.[0] ?? 0
    return { count: typeof count === 'number' ? count : parseInt(count, 10) || 0 }
  } catch (error) {
    const msg = `Error querying Log Analytics: ${error instanceof Error ? error.message : String(error)}`
    console.error(msg)
    return { count: 0, error: msg }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
  }

  // Check cache
  const cached = viewCountCache.get(slug)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ slug, views: cached.count })
  }

  // Query Log Analytics
  const result = await queryLogAnalytics(slug)

  // Only cache successful results
  if (!result.error) {
    viewCountCache.set(slug, { count: result.count, timestamp: Date.now() })
  }

  if (result.error) {
    return NextResponse.json({ slug, views: result.count, error: result.error })
  }

  return NextResponse.json({ slug, views: result.count })
}
