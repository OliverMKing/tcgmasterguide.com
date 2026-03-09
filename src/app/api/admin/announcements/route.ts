import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/user-roles'

// GET /api/admin/announcements - Get all announcements (active or not)
export async function GET() {
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

  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { type: 'asc' },
    })

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/announcements - Create or update an announcement
export async function PUT(request: Request) {
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

  try {
    const body = await request.json()
    const { type, message, active } = body

    if (!type || !['PUBLIC', 'SUBSCRIBER'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid announcement type. Must be PUBLIC or SUBSCRIBER.' },
        { status: 400 }
      )
    }

    if (active && (!message || typeof message !== 'string' || message.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Message is required when setting an active announcement.' },
        { status: 400 }
      )
    }

    const announcement = await prisma.announcement.upsert({
      where: { type },
      update: {
        message: active ? message.trim() : '',
        active: !!active,
      },
      create: {
        type,
        message: message?.trim() || '',
        active: !!active,
      },
    })

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    )
  }
}
