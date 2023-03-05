/* next.config.jsでも読み込めるようにcommonjsで書いている */
/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
require('dotenv').config()
const { envsafe, str, url } = require('envsafe')

const env = envsafe(
  {
    NODE_ENV: str({
      devDefault: 'development',
      choices: ['development', 'test', 'production'],
    }),
    API_BASE_URL: url({
      devDefault: 'http://localhost:8080',
    }),
  },
  {
    strict: true,
  }
)

module.exports.env = env
module.exports.isProduction = env.NODE_ENV === 'production'
