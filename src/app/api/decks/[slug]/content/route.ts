import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { hasSubscriberAccess } from '@/lib/user-roles'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Set via NEXT_PUBLIC_REQUIRE_SUBSCRIPTION env variable (defaults to false)
const REQUIRE_SUBSCRIPTION = process.env.NEXT_PUBLIC_REQUIRE_SUBSCRIPTION === 'true'

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

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Subscription required', hasAccess: false },
        { status: 403 }
      )
    }
  }

  // User has access - return the content
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { content } = matter(fileContent)

    return NextResponse.json({
      hasAccess: true,
      content,
    })
  } catch (error) {
    console.error('Error reading deck content:', error)
    return NextResponse.json(
      { error: 'Failed to read deck content' },
      { status: 500 }
    )
  }
}
