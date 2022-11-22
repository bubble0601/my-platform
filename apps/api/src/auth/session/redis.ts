import { Logger } from '@nestjs/common'
import createRedisStore from 'connect-redis'
import session from 'express-session'
import Redis from 'ioredis'
import { env } from '~/utils/env'

const redis = new Redis(env.REDIS_PORT, env.REDIS_HOST)
redis.on('connect', () => Logger.verbose('Connected to redis successfully'))
const RedisStore = createRedisStore(session)
export const redisStore = new RedisStore({ client: redis })
