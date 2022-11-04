import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined
}

let db: PrismaClient

// for Hot Reload
if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
  }
  db = global.__db
}

export { db }
