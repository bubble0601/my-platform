module.exports = (opts) =>
  require('pino-pretty')({
    ...opts,
    ignore: 'pid,hostname,reqId,responseTime,req,res',
    messageFormat: (log, messageKey) => {
      if (log.req) {
        return `[${log.req.method} ${log.req.url}] ${log[messageKey]}`
      }
      return `${log[messageKey]}`
    },
  })
