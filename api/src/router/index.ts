import { t } from '../core/trpc'
import auth from './auth'
import users from './users'

export const appRouter = t.router({
  auth,
  users,
})
export type AppRouter = typeof appRouter
