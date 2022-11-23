import { FastifyPluginAsync } from 'fastify'
import { isProduction } from '~/utils/env'

export const shutdownPlugin: FastifyPluginAsync = async (server) => {
  process.on('SIGINT', () => server.close())
  if (isProduction) {
    process.on('SIGTERM', () => server.close())
  } else {
    // Hot reload
    process.on('SIGTERM', async () => {
      console.log('[Hot Reload] Restarting server...')
      await server.close()
      process.exit(0)
    })
  }
}
