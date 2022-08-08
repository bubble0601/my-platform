class MainApp
  enable :logging
  configure :production do
    use Rack::CommonLogger, Logger.new(CONF.log.access, 'daily')
  end
  def logger
    return @logger if @logger

    @logger = settings.development? ? Logger.new($stdout) : Logger.new(CONF.log.app, 'monthly')
  end
end

DB.loggers << Logger.new($stdout)
DB.sql_log_level = :debug
