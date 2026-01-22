import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

interface CommentWithReplies {
  id: string
  content: string
  deckSlug: string | null
  userId: string
  userName: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  replies: CommentWithReplies[]
}

// GET /api/qna - Get all comments (both deck comments and Q&A questions)
export async function GET() {
  try {
    // Get all top-level comments (no parentId) with their replies
    const comments = await prisma.comment.findMany({
      where: { parentId: null },
      orderBy: { createdAt: 'desc' },
    })

    // Get all replies
    const replies = await prisma.comment.findMany({
      where: { parentId: { not: null } },
      orderBy: { createdAt: 'asc' },
    })

    // Build a map of parent ID to replies
    const repliesMap = new Map<string, typeof replies>()
    for (const reply of replies) {
      const parentReplies = repliesMap.get(reply.parentId!) || []
      parentReplies.push(reply)
      repliesMap.set(reply.parentId!, parentReplies)
    }

    // Attach replies to comments
    const commentsWithReplies: CommentWithReplies[] = comments.map((comment) => ({
      ...comment,
      replies: (repliesMap.get(comment.id) || []).map((r) => ({
        ...r,
        replies: [],
      })),
    }))

    return NextResponse.json({
      comments: commentsWithReplies,
    })
  } catch (error) {
    console.error('Error fetching Q&A comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/qna - Create a new Q&A question (not tied to a deck)
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
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Question too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    const userName =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || 'Anonymous'

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        deckSlug: null, // Q&A questions are not tied to a deck
        userId,
        userName,
        parentId: null,
      },
    })

    return NextResponse.json({ ...comment, replies: [] }, { status: 201 })
  } catch (error) {
    console.error('Error creating Q&A question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
