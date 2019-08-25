class MainApp < Sinatra::Base
  enable :logging
  configure :production do
    use Rack::CommonLogger, Logger.new(File.join(ROOT, CONF.log.access), shift_age='daily')
    err_log  = Logger.new(File.join(ROOT, CONF.log.error), shift_age='monthly')
    def err_log.write(msg)
      self << msg
    end
    $stderr = err_log
  end
  def logger
    return super if settings.development?
    return @logger unless @logger.nil?
    @logger = Logger.new(File.join(ROOT, CONF.log.app), shift_age='monthly')
  end
end

if CONF.app.debug
  DB.loggers << Logger.new($stdout)
  DB.sql_log_level = :debug
else
  DB.loggers << Logger.new(File.join(ROOT, CONF.log.db, shift_age='daily'))
end