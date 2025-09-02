import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error'], // si quieres, quita 'query' para no llenar logs
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db
