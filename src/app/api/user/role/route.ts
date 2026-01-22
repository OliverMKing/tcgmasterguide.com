import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET /api/user/role - Get the current user's role
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ role: null })
    }

    const user = await prisma.user.findUnique({
      where: { authId: userId },
      select: { role: true },
    })

    return NextResponse.json({ role: user?.role ?? null })
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json({ role: null })
  }
}
