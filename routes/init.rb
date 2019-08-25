require_relative 'main'
Dir.glob('./routes/*.rb').grep_v(/main\.rb$/).sort.each {|f| require f }
