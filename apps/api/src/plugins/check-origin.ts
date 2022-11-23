import { FastifyPluginCallback } from 'fastify'
import { env } from 'process'

const filteredMethods = ['post', 'put', 'delete']

// Same-site: laxとOriginのチェックでCSRF対策
export const checkOriginPlugin: FastifyPluginCallback = async (server) => {
  server.addHook('onRequest', (request, reply, done) => {
    if (
      filteredMethods.includes(request.method.toLowerCase()) &&
      request.headers['origin'] !== env.LOCATION_ORIGIN
    ) {
      reply.code(400)
      done(new Error())
    }
    done()
  })
}
