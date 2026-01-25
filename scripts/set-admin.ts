import { PrismaMssql } from '@prisma/adapter-mssql'
import { PrismaClient } from '../src/generated/prisma'

// Parse the DATABASE_URL into mssql config
function parseDatabaseUrl(url: string) {
  const [, rest] = url.split('://')
  const [hostPort, ...params] = rest.split(';')
  const [server, port] = hostPort.split(':')

  const config: Record<string, string> = {}
  for (const param of params) {
    const [key, value] = param.split('=')
    if (key && value) {
      config[key.toLowerCase()] = value
    }
  }

  return {
    server,
    port: parseInt(port || '1433', 10),
    database: config.database,
    user: config.user,
    password: config.password,
    options: {
      encrypt: config.encrypt === 'true',
      trustServerCertificate: config.trustservercertificate === 'true',
    },
  }
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const adapter = new PrismaMssql(parseDatabaseUrl(databaseUrl))
const prisma = new PrismaClient({ adapter })

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
