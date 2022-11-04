import { initTRPC, TRPCError } from '@trpc/server'
import SuperJSON from 'superjson'
import { Context } from './context'

export const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
})

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    })
  }
  return next({
    ctx,
  })
})
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
