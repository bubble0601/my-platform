class MainApp
  enable :logging
  configure :production do
    use Rack::CommonLogger, Logger.new(CONF.log.access, 'daily')
  end
  def logger
    return super if settings.development?

    @logger ||= Logger.new(CONF.log.app, 'monthly')
  end
end

if CONF.app.debug
  DB.loggers << Logger.new($stdout)
  DB.sql_log_level = :debug
else
  DB.loggers << Logger.new(CONF.log.db, 'daily')
end
