import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/user-roles'

type SortField = 'createdAt' | 'userName' | 'deckTitle'
type SortOrder = 'asc' | 'desc'

// GET /api/admin/comments - Get all pending comments with pagination and sorting
export async function GET(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { authId: userId },
  })

  if (!currentUser || !isAdmin(currentUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '15', 10), 15)
  const sortBy = (searchParams.get('sortBy') || 'createdAt') as SortField
  const sortOrder = (searchParams.get('sortOrder') || 'asc') as SortOrder
  const skip = (page - 1) * limit

  // Validate sort field
  const validSortFields: SortField[] = ['createdAt', 'userName', 'deckTitle']
  const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
  const finalSortOrder: SortOrder = sortOrder === 'desc' ? 'desc' : 'asc'

  try {
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { approved: false, parentId: null },
        orderBy: { [finalSortBy]: finalSortOrder },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { approved: false, parentId: null } }),
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
    console.error('Error fetching pending comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
