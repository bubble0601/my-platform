require 'sequel'

DB = Sequel.connect(
  adapter: CONF.db.adapter,
  host: CONF.db.host,
  user: CONF.db.user,
  password: CONF.db.password,
  database: CONF.db.database,
)

module Sequel
  class Model
    def slice(*keys)
      self.values.slice(*keys)
    end
  end
end

Sequel::Model.plugin :timestamps, update_on_create: true

Dir.glob('./models/*.rb').sort.each {|f| require f }
