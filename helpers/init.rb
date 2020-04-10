Dir.glob(Pathname.new(__dir__).join('*.rb')).sort.each {|f| require f }
