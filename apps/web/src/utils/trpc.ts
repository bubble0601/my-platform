import type { AppRouter } from '@internal/api'
import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import SuperJSON from 'superjson'

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      transformer: SuperJSON,
      /**
       * @link https://tanstack.com/query/v4/docs/reference/QueryClient
       **/
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    }
  },
  ssr: true,
})
