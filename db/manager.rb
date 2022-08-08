require 'sequel'
require 'logger'
require 'fileutils'
require_relative '../server/app/config'

Sequel.extension :migration
# DB = Sequel.connect(ENV['DB'])
DB = Sequel.connect(
  adapter: CONF.db.adapter,
  host: CONF.db.host,
  user: CONF.db.user,
  password: CONF.db.password,
  database: CONF.db.database
)

MIGRATION_DIR = "#{__dir__}/migrate".freeze

case ARGV[0]
when /^i(nfo)?$/
  current = DB[:schema_info].first[:version]
  migrations = Dir["#{MIGRATION_DIR}/*.rb"].map{ |e| File.basename(e, '.rb') }.sort
  latest = migrations.last.to_i

  d = [current.to_s.length, latest.to_s.length].max
  puts "current version: %#{d}d" % current
  puts " latest version: %#{d}d" % latest
  puts

  if current < latest
    puts '*** Unapplied files ***'
    migrations.filter{ |m| m.to_i > current }.each do |f|
      puts "+ #{f}.rb"
    end
  elsif current > latest
    puts '\e[31mERROR: Invalid State'
  else
    puts 'Up to date'
  end

when /^m(igrate)?$/
  if Sequel::Migrator.is_current?(DB, MIGRATION_DIR)
    puts 'already up to date'
    return
  end

  DB.logger = Logger.new($stderr)

  if ARGV[1] == 'all'
    Sequel::Migrator.run(DB, MIGRATION_DIR)
  elsif ARGV[1]
    Sequel::Migrator.run(DB, MIGRATION_DIR, target: ARGV[1].to_i)
  else
    Sequel::Migrator.run(DB, MIGRATION_DIR, relative: 1)
  end

when /^a(dd)?$/
  unless ARGV[1]
    puts 'Please specify filename'
    return
  end
  ext = File.extname(ARGV[1])
  basename = File.basename(ARGV[1], ext)
  n = Dir["#{__dir__}/migrate/*.rb"].length + 1
  FileUtils.copy("#{__dir__}/migrator.rb", "#{MIGRATION_DIR}/%04d_#{basename}.rb" % n)

when /^r(un)?$/
  unless %w[up down].include?(ARGV[1])
    puts 'Please specify direction(up or down)'
    return
  end

  DB.logger = Logger.new($stderr)

  require_relative './migrator'
  Sequel::Migration.descendants[0].apply(DB, ARGV[1].to_sym)

else
  puts 'Usage:'
  puts '  i(nfo)                    show information'
  puts '  m(igrate) [<version>|all]   execute migration'
  puts '  a(dd) <filename>          add migrator'
  puts '  r(un) up|down             testrun migrator'
end
