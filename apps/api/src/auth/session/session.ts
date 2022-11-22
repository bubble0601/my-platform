import { MiddlewareConsumer } from '@nestjs/common'
import session from 'express-session'
import passport from 'passport'
import { env, isProduction } from '~/utils/env'
import { redisStore } from './redis'

// 2週間
const SESSION_EXPIRE = 60 * 60 * 24 * 14

export const configureSession = (consumer: MiddlewareConsumer) => {
  consumer
    .apply(
      session({
        store: redisStore,
        secret: env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: {
          sameSite: 'lax',
          httpOnly: true,
          secure: isProduction,
          maxAge: SESSION_EXPIRE,
          path: '/',
        },
      }),
      passport.initialize(),
      passport.session()
    )
    .forRoutes('*')
}
