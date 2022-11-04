import cookie from 'cookie'
import { IncomingMessage, ServerResponse } from 'http'
import { nanoid } from 'nanoid'
import superjson from 'superjson'
import { z } from 'zod'
import { env } from '../../utils/env'
import { redis } from '../../utils/redis'
import { sign, unsign } from './crypto'

const sessionSchema = z.object({
  userId: z.bigint(),
})
export type Session = z.infer<typeof sessionSchema>

// 2週間
const SESSION_EXPIRE = 60 * 60 * 24 * 14

export const createSession = async (
  req: IncomingMessage,
  res: ServerResponse,
  newSession: Session
) => {
  const rawCookie = req.headers['cookie']

  const cookieVal = rawCookie && cookie.parse(rawCookie)[env.COOKIE_NAME]
  if (cookieVal) {
    const oldSessionId = await unsign(cookieVal)
    if (oldSessionId) redis.del(oldSessionId)
  }

  const newSessionid = nanoid()
  await redis.setex(newSessionid, SESSION_EXPIRE, superjson.stringify(newSession))

  const newCookie = cookie.serialize(env.COOKIE_NAME, await sign(newSessionid), {
    maxAge: SESSION_EXPIRE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
  res.setHeader('set-cookie', newCookie)
}

export const getSession = async (req: IncomingMessage): Promise<Session | void> => {
  try {
    const rawCookie = req.headers['cookie']
    if (!rawCookie) return

    const cookieVal = cookie.parse(rawCookie)[env.COOKIE_NAME]
    if (!cookieVal) return

    const sessionId = await unsign(cookieVal)
    if (!sessionId) return

    const rawSession = await redis.get(sessionId)
    if (!rawSession) return

    return sessionSchema.parse(superjson.parse(rawSession))
  } catch (e) {
    return
  }
}

export const destroySession = async (req: IncomingMessage, res: ServerResponse) => {
  const rawCookie = req.headers['cookie']

  const cookieVal = rawCookie && cookie.parse(rawCookie)[env.COOKIE_NAME]
  if (cookieVal) {
    const sessionId = await unsign(cookieVal)
    if (sessionId) redis.del(sessionId)
  }

  const newCookie = cookie.serialize(env.COOKIE_NAME, '', {
    expires: new Date(0),
  })
  res.setHeader('set-cookie', newCookie)
}
