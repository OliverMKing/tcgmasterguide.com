import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/user-roles'

// DELETE /api/comments/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const dbUser = await prisma.user.findUnique({
    where: { authId: userId },
  })

  if (!dbUser || !isAdmin(dbUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  try {
    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
