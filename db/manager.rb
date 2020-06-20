DB_ROOT = File.dirname(__FILE__)

case ARGV[0]
when 'add'
  unless ARGV[1]
    puts 'Please specify filename'
    return
  end
  ext = File.extname(ARGV[1])
  basename = File.basename(ARGV[1], ext)
  n = Dir["#{DB_ROOT}/migrate/*.rb"].length
  FileUtils.copy("#{DB_ROOT}/migrator.rb", "%04d_#{basename}.rb" % n)

when 'run'
  unless %w[up down].include?(ARGV[1])
    puts 'Please specify direction(up or down)'
    return
  end

  require 'sequel'
  require 'logger'
  require './app/config'

  Sequel.extension :migration

  db = Sequel.connect(
    adapter: CONF.db.adapter,
    host: CONF.db.host,
    user: CONF.db.user,
    password: CONF.db.password,
    database: CONF.db.database
  )
  db.loggers << Logger.new($stdout)
  db.sql_log_level = :debug

  require_relative './migrator'
  Sequel::Migration.descendants[0].apply(db, ARGV[1].to_sym)

else
  puts 'Usage:'
  puts '  run up|down       execute migrator'
  puts '  add <filename>    add migrator'
end
