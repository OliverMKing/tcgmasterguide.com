import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setAdmin(authId: string, email: string) {
  const user = await prisma.user.upsert({
    where: { authId },
    update: { role: 'ADMIN', email },
    create: { authId, email, role: 'ADMIN' },
  })

  console.log(`Successfully set "${user.email}" (authId: ${authId}) as admin`)
}

const authId = process.argv[2]
const email = process.argv[3]

if (!authId || !email) {
  console.error('Usage: npx tsx scripts/set-admin.ts <authId> <email>')
  console.error('Example: make set-admin AUTH_ID=user_abc123 EMAIL=user@example.com')
  process.exit(1)
}

setAdmin(authId, email)
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
