require 'sequel'
require './app/config'

DB = Sequel.connect(
  adapter: CONF.db.adapter,
  host: CONF.db.host,
  user: CONF.db.user,
  password: CONF.db.password,
  database: CONF.db.database
)

def pp_schema(table)
  maxlen = DB.schema(table).map{ |c| c[0].length }.max
  l = (maxlen + 3) / 2 * 2

  DB.schema(table).each do |col|
    name = col[0]
    info = col[1]

    informations = []
    informations.push(info[:db_type])
    informations.push('PRIMARY KEY') if info[:primary_key]
    informations.push('AUTO INCREMENT') if info[:auto_increment]
    informations.push('NOT NULL') unless info[:allow_null]
    informations.push('DEFAULT %s' % info[:default]) if info[:default]

    puts format("#   %-#{l}s%s", "#{name}:", informations.join(', '))
  end
end

if ARGV[0]
  pp_schema(ARGV[0].to_sym)
else
  puts 'Usage: pp_schema.rb <table name>'
end
