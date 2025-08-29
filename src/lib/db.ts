import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Fuerza la URL pooled (6543) en runtime:
    datasources: {
      db: { url: process.env.DATABASE_URL! },
    },
    log: ['warn', 'error'], // si quieres, quita 'query' para no llenar logs
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db
