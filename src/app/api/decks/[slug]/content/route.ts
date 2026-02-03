import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { hasSubscriberAccess } from '@/lib/user-roles'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Set via NEXT_PUBLIC_REQUIRE_SUBSCRIPTION env variable (defaults to false)
const REQUIRE_SUBSCRIPTION = process.env.NEXT_PUBLIC_REQUIRE_SUBSCRIPTION === 'true'

// Content visibility markers
const PUBLIC_START = '<!-- PUBLIC -->'
const PUBLIC_END = '<!-- /PUBLIC -->'
const PREMIUM_START = '<!-- PREMIUM -->'
const PREMIUM_END = '<!-- /PREMIUM -->'
const PREMIUM_PLACEHOLDER = ':::PREMIUM_LOCKED:::'

/**
 * Parse content and extract public/premium sections.
 * Content without markers defaults to PREMIUM (secure by default).
 * Returns full content for subscribers, public-only with placeholders for non-subscribers.
 */
function parseContentByVisibility(content: string, hasAccess: boolean): string {
  if (hasAccess) {
    // Subscribers get full content, just strip the markers
    return content
      .replace(new RegExp(PUBLIC_START, 'g'), '')
      .replace(new RegExp(PUBLIC_END, 'g'), '')
      .replace(new RegExp(PREMIUM_START, 'g'), '')
      .replace(new RegExp(PREMIUM_END, 'g'), '')
      .trim()
  }

  // For non-subscribers, we need to:
  // 1. Keep content inside PUBLIC markers
  // 2. Replace content inside PREMIUM markers with placeholder
  // 3. Replace unmarked content with placeholder (secure by default)

  const result: string[] = []
  let position = 0
  let hasUnmarkedContent = false

  // Regex to find all markers
  const markerRegex = /<!-- (\/?)(PUBLIC|PREMIUM) -->/g
  const markers: Array<{ type: 'PUBLIC' | 'PREMIUM'; isEnd: boolean; index: number; fullMatch: string }> = []

  let match
  while ((match = markerRegex.exec(content)) !== null) {
    markers.push({
      type: match[2] as 'PUBLIC' | 'PREMIUM',
      isEnd: match[1] === '/',
      index: match.index,
      fullMatch: match[0],
    })
  }

  if (markers.length === 0) {
    // No markers at all - entire content is premium by default
    return PREMIUM_PLACEHOLDER
  }

  // Process content between markers
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i]

    // Check for unmarked content before this marker
    if (marker.index > position) {
      const beforeContent = content.slice(position, marker.index).trim()
      if (beforeContent) {
        // Unmarked content is treated as premium
        if (!hasUnmarkedContent) {
          result.push(PREMIUM_PLACEHOLDER)
          hasUnmarkedContent = true
        }
      }
    }

    if (!marker.isEnd) {
      // Find the matching end marker
      const endMarkerIndex = markers.findIndex(
        (m, idx) => idx > i && m.isEnd && m.type === marker.type
      )

      if (endMarkerIndex !== -1) {
        const endMarker = markers[endMarkerIndex]
        const sectionContent = content.slice(
          marker.index + marker.fullMatch.length,
          endMarker.index
        ).trim()

        if (marker.type === 'PUBLIC') {
          result.push(sectionContent)
        } else if (marker.type === 'PREMIUM' && sectionContent) {
          result.push(PREMIUM_PLACEHOLDER)
        }

        position = endMarker.index + endMarker.fullMatch.length
        // Skip to the end marker in our iteration
        i = endMarkerIndex
      }
    }
  }

  // Check for unmarked content after the last marker
  if (position < content.length) {
    const afterContent = content.slice(position).trim()
    if (afterContent) {
      result.push(PREMIUM_PLACEHOLDER)
    }
  }

  // Collapse consecutive placeholders
  const collapsed: string[] = []
  for (const item of result) {
    if (item === PREMIUM_PLACEHOLDER) {
      if (collapsed[collapsed.length - 1] !== PREMIUM_PLACEHOLDER) {
        collapsed.push(item)
      }
    } else {
      collapsed.push(item)
    }
  }

  return collapsed.join('\n\n')
}

// GET /api/decks/[slug]/content - Get deck content if user has access
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Check if deck exists
  const filePath = path.join(process.cwd(), 'content', 'decks', `${slug}.md`)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
  }

  // Check subscription access
  let hasAccess = !REQUIRE_SUBSCRIPTION

  if (REQUIRE_SUBSCRIPTION) {
    const { userId } = await auth()

    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { authId: userId },
          select: { role: true },
        })
        hasAccess = hasSubscriberAccess(user?.role)
      } catch (error) {
        console.error('Error checking user access:', error)
      }
    }
  }

  // Return content based on access level
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { content } = matter(fileContent)

    const processedContent = parseContentByVisibility(content, hasAccess)

    return NextResponse.json({
      hasAccess,
      content: processedContent,
    })
  } catch (error) {
    console.error('Error reading deck content:', error)
    return NextResponse.json(
      { error: 'Failed to read deck content' },
      { status: 500 }
    )
  }
}
