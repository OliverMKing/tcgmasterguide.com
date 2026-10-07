import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { hasSubscriberAccessForLocale, type SubscriptionLocale } from '@/lib/user-roles'
import { parseContentByVisibility } from '@/lib/content-visibility'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Set via NEXT_PUBLIC_REQUIRE_SUBSCRIPTION env variable (defaults to false)
const REQUIRE_SUBSCRIPTION = process.env.NEXT_PUBLIC_REQUIRE_SUBSCRIPTION === 'true'

function getPostsDirectory(locale: SubscriptionLocale): string {
  if (locale === 'es') {
    return path.join(process.cwd(), 'content', 'posts', 'es')
  }
  return path.join(process.cwd(), 'content', 'posts')
}

// GET /api/posts/[slug]/content - Get post content if user has access
// Query params: ?locale=en|es (defaults to 'en')
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const searchParams = request.nextUrl.searchParams
  const localeParam = searchParams.get('locale')
  const locale: SubscriptionLocale = localeParam === 'es' ? 'es' : 'en'

  // Check if post exists for this locale
  const postsDirectory = getPostsDirectory(locale)
  const filePath = path.join(postsDirectory, `${slug}.md`)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Check subscription access for this locale
  let hasAccess = !REQUIRE_SUBSCRIPTION

  if (REQUIRE_SUBSCRIPTION) {
    const { userId } = await auth()

    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { authId: userId },
          select: {
            role: true,
            stripeSubscriptionStatus: true,
            stripeSubscriptionStatusEs: true,
          },
        })
        hasAccess = hasSubscriberAccessForLocale(user, locale)
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
    console.error('Error reading post content:', error)
    return NextResponse.json(
      { error: 'Failed to read post content' },
      { status: 500 }
    )
  }
}
