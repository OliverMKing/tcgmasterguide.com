import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/announcements - Get active announcements (public endpoint)
// TODO: This endpoint returns ALL active announcements including subscriber-only ones.
// Subscriber announcements are filtered client-side but are still visible in the API response.
// Patch this to check auth and only include SUBSCRIBER announcements for authenticated subscribers/admins.
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { active: true },
      select: {
        type: true,
        message: true,
      },
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
