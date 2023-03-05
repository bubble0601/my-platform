import fastifyCookie from '@fastify/cookie'
import fastifyEtag from '@fastify/etag'
import fastifySession from '@fastify/session'
import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify'
import mercurius from 'mercurius'
import { sessionStore } from '~/auth/session'
import { checkOriginPlugin, prismaPlugin, shutdownPlugin } from '~/plugins'
import { env, isProduction } from '~/utils/env'
import { Context } from './context'
import { schema } from './schema'

const createServer = (opts: FastifyServerOptions = {}): FastifyInstance => {
  const server = fastify(opts)

  server.register(prismaPlugin)
  server.register(shutdownPlugin)
  server.register(fastifyEtag)

  server.register(fastifyCookie)
  server.register(fastifySession, {
    secret: env.SESSION_SECRET,
    cookieName: env.COOKIE_NAME_FOR_SESSION,
    cookie: {
      maxAge: 60 * 60 * 24 * 14,
      secure: isProduction,
      httpOnly: true,
      sameSite: 'lax',
    },
    saveUninitialized: false,
    store: sessionStore,
  })
  server.register(checkOriginPlugin)

  server.register(mercurius, {
    schema,
    graphiql: !isProduction,
    context(request, reply): Context {
      return {
        db: server.prisma,
        request,
        reply,
      }
    },
  })

  return server
}

export const startServer = async () => {
  const server = createServer({
    logger: !isProduction
      ? {
          transport: {
            target: './pino-pretty-transport',
            options: {
              translateTime: 'yyyy-mm-dd HH:MM:ss',
            },
          },
        }
      : true,
  })
  try {
    await server.listen({
      port: env.PORT,
    })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
