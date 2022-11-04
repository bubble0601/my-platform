import { envsafe, str } from 'envsafe'

export const env = envsafe({
  DATABASE_URL: str(),
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
