require_relative '../init'

class MusicTest < TestBase
  def test_post_mp3
    file = Rack::Test::UploadedFile.new('./storage/temp/07 Never Let Go.mp3', 'audio/mp3')
    post '/api/music/songs', { file: file }
    p Song.last
    file2 = Rack::Test::UploadedFile.new('./storage/temp/06 Time will tell.mp3', 'audio/mp3')
    file3 = Rack::Test::UploadedFile.new('./storage/temp/03 In My Room.mp3', 'audio/mp3')
    post '/api/music/songs', { file: [file2, file3] }
    p Song.last(2)
  end

  def test_search_info
    get '/api/music/tools/searchinfo', { title: 'See you again', artist: 'Wiz Khalifa' }
    if last_response.status.to_i == 200
      json = parse(last_response)
      open('./storage/temp/foo.json', 'w'){ |f| f.write(JSON.pretty_generate(json)) }
      assert json[0][:title] == 'See You Again'
      assert json[0][:artist] == 'Wiz Khalifa feat. Charlie Puth'
      assert json[0][:year] == 2015
    else
      open('./storage/temp/foo.html', 'w'){ |f| f.write(last_response.body) }
    end

    get '/api/music/tools/searchinfo', { title: 'Just a man in love', artist: '桑田佳祐' }
    json = parse(last_response)
    puts JSON.pretty_generate(json)
  end
end
