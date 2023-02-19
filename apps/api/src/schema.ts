import path from 'path'
import { applyMiddleware } from 'graphql-middleware'
import { makeSchema } from 'nexus'
import * as NexusPrismaScalars from 'nexus-prisma/scalars'
import { permissions } from './auth/permissions'
import * as types from './graphql'

const schemaWithoutPermission = makeSchema({
  types: [NexusPrismaScalars, types],
  outputs: {
    schema: path.join(__dirname, 'schema.gql'),
    typegen: path.join(__dirname, 'nexus-types.d.ts'),
  },
  contextType: {
    module: path.join(__dirname, 'context.ts'),
    export: 'Context',
  },
})

export const schema = applyMiddleware(schemaWithoutPermission, permissions)
