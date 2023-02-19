import type { SessionStore } from '@fastify/session'
import Redis from 'ioredis'
import { z } from 'zod'
import { env } from '~/utils/env'

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
})

const SESSION_EXPIRE = 60 * 60 * 24 * 14
const sessionDataSchema = z.object({
  user: z
    .object({
      id: z.string().transform((v) => BigInt(v)),
      name: z.string(),
    })
    .optional(),
})
type SessionDataInput = z.input<typeof sessionDataSchema>
type SessionDataOutput = z.output<typeof sessionDataSchema>

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Session extends SessionDataOutput {}
}

export const sessionStore: SessionStore = {
  async get(sessionId, callback) {
    try {
      const rawSession = await redis.get(sessionId)
      if (!rawSession) callback(null, {} as any)
      else callback(null, sessionDataSchema.parse(JSON.parse(rawSession)) as any)
    } catch (e) {
      const error = e instanceof Error ? e : new Error('An error ocurred while loading session.')
      callback(error, null as any)
    }
  },
  set(sessionId, session, callback) {
    const sessionData: SessionDataInput | null = session.user
      ? { user: { id: session.user.id.toString(), name: session.user.name } }
      : null
    redis
      .setex(sessionId, SESSION_EXPIRE, JSON.stringify(sessionData))
      .then(() => callback())
      .catch((e) =>
        callback(e instanceof Error ? e : new Error('An error ocurred while saving session.'))
      )
  },
  destroy(sessionId, callback) {
    redis
      .del(sessionId)
      .then(() => callback())
      .catch((e) =>
        callback(e instanceof Error ? e : new Error('An error ocurred while deleteing session.'))
      )
  },
}
