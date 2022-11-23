import { PrismaClient } from '@prisma/client'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export const prismaPlugin: FastifyPluginAsync = fp(async (server) => {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  })

  await prisma.$connect()

  server.decorate('prisma', prisma)
  server.addHook('onClose', async (server) => {
    server.log.info('[Prisma Plugin] disconnecting Prisma from DB')
    await server.prisma.$disconnect()
  })
})
