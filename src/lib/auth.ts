import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth()
  if (!userId) return false

  const user = await prisma.user.findUnique({
    where: { authId: userId },
    select: { role: true },
  })

  return user?.role === 'ADMIN'
}
