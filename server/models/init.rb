require 'sequel'

DB = Sequel.connect(
  adapter: CONF.db.adapter,
  host: CONF.db.host,
  user: CONF.db.user,
  password: CONF.db.password,
  database: CONF.db.database
)

module Sequel
  class Model
    def slice(*keys)
      values.slice(*keys)
    end
  end
end

Sequel::Model.plugin :timestamps, update_on_create: true
Sequel::Model.plugin :validation_helpers
Sequel.extension :symbol_aref_refinement, :core_refinements

Dir.glob('*/init.rb', base: __dir__).sort.each{ |f| require_relative f }
Dir.glob('*.rb', base: __dir__).sort.each{ |f| require_relative f }
