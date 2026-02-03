import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin, hasSubscriberAccess } from '@/lib/user-roles'

type SortField = 'createdAt' | 'userName'
type SortOrder = 'asc' | 'desc'

// GET /api/comments?deckSlug=xxx or GET /api/comments (all comments for Q&A)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const deckSlug = searchParams.get('deckSlug')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '15', 10), 15)
  const sortBy = (searchParams.get('sortBy') || 'createdAt') as SortField
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as SortOrder
  const skip = (page - 1) * limit

  // Validate sort field
  const validSortFields: SortField[] = ['createdAt', 'userName']
  const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
  const finalSortOrder: SortOrder = sortOrder === 'asc' ? 'asc' : 'desc'

  const { userId } = await auth()

  // Check user role
  let userIsAdmin = false
  let userHasSubscriberAccess = hasSubscriberAccess(null) // Check if subscription is disabled
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { authId: userId },
    })
    userIsAdmin = isAdmin(dbUser?.role)
    userHasSubscriberAccess = hasSubscriberAccess(dbUser?.role)
  }

  // Only subscribers can access comments
  if (!userHasSubscriberAccess) {
    return NextResponse.json(
      { error: 'Subscription required to view comments' },
      { status: 403 }
    )
  }

  // Build deck filter: null = no filter, '' = only null deckSlug (Other), 'slug' = specific deck
  const deckFilter = deckSlug === null
    ? {}
    : deckSlug === ''
      ? { deckSlug: null }
      : { deckSlug }

  const whereClause = {
    // Only top-level comments (parentId is null)
    parentId: null,
    // Deck filter
    ...deckFilter,
    // Admins see all, users see approved + their own pending
    OR: userIsAdmin
      ? undefined
      : [
          { approved: true },
          ...(userId ? [{ userId, approved: false }] : []),
        ],
  }

  try {
    // Fetch top-level comments with their replies
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: whereClause,
        include: {
          replies: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { [finalSortBy]: finalSortOrder },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: whereClause }),
    ])

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
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

  // Check if user has subscriber access
  const dbUser = await prisma.user.findUnique({
    where: { authId: userId },
  })

  if (!hasSubscriberAccess(dbUser?.role)) {
    return NextResponse.json(
      { error: 'Subscription required to post comments' },
      { status: 403 }
    )
  }

  const userIsAdmin = isAdmin(dbUser?.role)

  try {
    const body = await request.json()
    const { deckSlug, deckTitle, content, parentId } = body

    if (!content) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    // Only admins can reply
    if (parentId && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Only admins can reply to comments' },
        { status: 403 }
      )
    }

    // Check that parent comment is approved before allowing reply
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
      if (!parentComment.approved) {
        return NextResponse.json(
          { error: 'Cannot reply to an unapproved comment' },
          { status: 400 }
        )
      }
    }

    const userName =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || 'Anonymous'

    const comment = await prisma.comment.create({
      data: {
        deckSlug: deckSlug || null,
        deckTitle: deckTitle || null,
        content: content.trim(),
        userId,
        userName,
        approved: userIsAdmin,
        parentId: parentId || null,
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
