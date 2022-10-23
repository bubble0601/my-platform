import { t } from '../trpc'
import users from './users'

export const appRouter = t.router({
  users,
})
export type AppRouter = typeof appRouter
