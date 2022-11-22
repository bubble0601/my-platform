import { config } from 'dotenv'
import { envsafe, port, str, ValidatorSpec } from 'envsafe'

config()
export const env = envsafe({
  NODE_ENV: str({
    devDefault: 'development',
    choices: ['development', 'test', 'production'],
  }) as ValidatorSpec<'development' | 'test' | 'production'>,
  PORT: port({
    devDefault: 8080,
  }),
  DATABASE_URL: str(),
  REDIS_HOST: str({
    default: 'localhost',
  }),
  REDIS_PORT: port({
    default: 6379,
  }),
  HASHIDS_SALT: str({
    devDefault: 'rainbow',
  }),
  COOKIE_NAME: str({
    default: '_sid',
  }),
  SESSION_SECRET: str({
    devDefault: 'secret',
  }),
})

export const isProduction = env.NODE_ENV === 'production'
