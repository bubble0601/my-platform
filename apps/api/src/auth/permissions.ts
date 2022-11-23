import { allow, rule, shield } from 'graphql-shield'

const rules = {
  isAuthenticated: rule({ cache: 'contextual' })(async (parent, args, ctx) => {
    return Boolean(ctx.request.session.user)
  }),
}

export const permissions = shield({
  Query: {
    '*': rules.isAuthenticated,
  },
  Mutation: {
    '*': rules.isAuthenticated,
    login: allow,
  },
})
