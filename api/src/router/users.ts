import { t } from '../core/trpc'

export default t.router({
  get: t.procedure.query(({ ctx }) => ({
    id: 'foobar',
    name: ctx.session ? ctx.session.userId : 'guest',
  })),
})
