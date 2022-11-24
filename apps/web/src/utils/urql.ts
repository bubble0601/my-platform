import { createClient, dedupExchange, fetchExchange } from '@urql/core'
import { cacheExchange } from '@urql/exchange-graphcache'
import { requestPolicyExchange } from '@urql/exchange-request-policy'

export const client = createClient({
  url: '/graphql',
  fetchOptions: {
    credentials: 'include',
  },
  exchanges: [
    dedupExchange,
    requestPolicyExchange({ ttl: 60 * 1000 }),
    cacheExchange({}),
    fetchExchange,
  ],
})
