import dotenv from 'dotenv'
dotenv.config()

import { randomBytes } from 'crypto'
import { envsafe, port, str, ValidatorSpec } from 'envsafe'

export const env = envsafe({
  NODE_ENV: str({
    devDefault: 'development',
    choices: ['development', 'test', 'production'],
  }) as ValidatorSpec<'development' | 'test' | 'production'>,
  PORT: port({
    devDefault: 8080,
  }),
  LOCATION_ORIGIN: str({
    devDefault: `http://localhost:${process.env.PORT ?? 8080}`,
  }),
  DATABASE_URL: str(),
  REDIS_HOST: str({
    default: 'localhost',
  }),
  REDIS_PORT: port({
    default: 6379,
  }),
  COOKIE_NAME_FOR_SESSION: str({
    default: '_sid',
  }),
  SESSION_SECRET: str({
    devDefault: randomBytes(24).toString('base64'),
  }),
})

export const isProduction = env.NODE_ENV === 'production'
