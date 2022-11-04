import { inferAsyncReturnType } from '@trpc/server'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getSession } from './session'

export async function createContext({ req, res }: CreateNextContextOptions) {
  const session = await getSession(req)

  return {
    req,
    res,
    session,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
