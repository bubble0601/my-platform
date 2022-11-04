import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createSession, destroySession } from '../core/session'
import { publicProcedure, t } from '../core/trpc'
import { db } from '../utils/db'

export default t.router({
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx: { req, res } }) => {
      const user = await db.user.findFirst({ where: { name: input.username } })
      if (user && (await bcrypt.compare(input.password, user.password))) {
        await createSession(req, res, { userId: user.id })
        res.redirect('/')
      }
    }),
  logout: publicProcedure.mutation(async ({ ctx: { req, res } }) => {
    await destroySession(req, res)
    res.redirect('/login')
  }),
})
