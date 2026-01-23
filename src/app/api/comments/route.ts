import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/user-roles'

// GET /api/comments?deckSlug=xxx
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const deckSlug = searchParams.get('deckSlug')

  if (!deckSlug) {
    return NextResponse.json({ error: 'deckSlug is required' }, { status: 400 })
  }

  // Check if user is admin to show all comments
  const { userId } = await auth()
  let showAll = false
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { authId: userId },
    })
    showAll = isAdmin(dbUser?.role)
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        deckSlug,
        // Show all comments to admins, only approved to others
        ...(showAll ? {} : { approved: true }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/comments
export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { deckSlug, content } = body

    if (!deckSlug || !content) {
      return NextResponse.json(
        { error: 'deckSlug and content are required' },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    const userName =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || 'Anonymous'

    const comment = await prisma.comment.create({
      data: {
        deckSlug,
        content: content.trim(),
        userId,
        userName,
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
