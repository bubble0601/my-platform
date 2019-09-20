class MainApp < Sinatra::Base
  enable :logging
  configure :production do
    use Rack::CommonLogger, Logger.new(CONF.log.access, shift_age = 'daily')
  end
  def logger
    return super if settings.development?
    return @logger unless @logger.nil?
    @logger = Logger.new(CONF.log.app, shift_age = 'monthly')
  end
end

if CONF.app.debug
  DB.loggers << Logger.new($stdout)
  DB.sql_log_level = :debug
else
  DB.loggers << Logger.new(CONF.log.db, shift_age = 'daily')
end
