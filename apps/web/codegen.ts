import dotenv from 'dotenv'
dotenv.config()

import { CodegenConfig } from '@graphql-codegen/cli'
import { env } from './src/utils/env'

const config: CodegenConfig = {
  schema: `${env.API_BASE_URL}/graphql`,
  documents: ['src/**/*.tsx', '!src/@generated/**/*'],
  generates: {
    './src/@generated/': {
      preset: 'client',
      plugins: [],
    },
  },
}

export default config
