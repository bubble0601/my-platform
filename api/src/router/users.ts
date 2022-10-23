import { t } from '../trpc'

export default t.router({
  get: t.procedure.query(() => ({
    id: 'foobar',
    name: 'world',
  })),
})
