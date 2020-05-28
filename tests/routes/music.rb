require_relative '../init'

class MusicTest < TestBase
  def test_post_mp3
    file = Rack::Test::UploadedFile.new("./storage/temp/07 Never Let Go.mp3", 'audio/mp3')
    post '/api/music/songs', { file: file }
    p Song.last
    file2 = Rack::Test::UploadedFile.new("./storage/temp/06 Time will tell.mp3", 'audio/mp3')
    file3 = Rack::Test::UploadedFile.new("./storage/temp/03 In My Room.mp3", 'audio/mp3')
    post '/api/music/songs', { file: [file2, file3] }
    p Song.last(2)
  end
end
