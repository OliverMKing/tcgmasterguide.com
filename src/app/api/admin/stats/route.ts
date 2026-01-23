import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin, UserRole } from '@/lib/user-roles'

// GET /api/admin/stats
export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if current user is admin
  const currentUser = await prisma.user.findUnique({
    where: { authId: userId },
  })

  if (!currentUser || !isAdmin(currentUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [totalUsers, adminCount, subscriberCount, userCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.user.count({ where: { role: UserRole.SUBSCRIBER } }),
      prisma.user.count({ where: { role: UserRole.USER } }),
    ])

    return NextResponse.json({
      totalUsers,
      byRole: {
        [UserRole.ADMIN]: adminCount,
        [UserRole.SUBSCRIBER]: subscriberCount,
        [UserRole.USER]: userCount,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
