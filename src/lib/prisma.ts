import { PrismaMssql } from '@prisma/adapter-mssql'
import { PrismaClient } from '@/generated/prisma'

// Parse the DATABASE_URL into mssql config
function parseDatabaseUrl(url: string) {
  // Format: sqlserver://host:port;database=db;user=user;password=pass;encrypt=true;trustServerCertificate=true
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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const config = parseDatabaseUrl(databaseUrl)
  const adapter = new PrismaMssql(config)
  return new PrismaClient({ adapter })
}

// Lazy initialization - only create client when first accessed
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    return Reflect.get(globalForPrisma.prisma, prop)
  },
})
