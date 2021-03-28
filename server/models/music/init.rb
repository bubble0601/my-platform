require_relative 'util'
Dir.glob('*.rb', base: __dir__).sort.each{ |f| require_relative f }
