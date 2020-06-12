require './lib/music/search'

class MainApp
  namespace '/api/music' do
    helpers MusicHelpers
  end

  namespace '/static/music' do
    helpers MusicHelpers
  end
end

Dir.glob('*.rb', base: __dir__).sort.each{ |f| require_relative f }
