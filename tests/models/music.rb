require_relative '../init'

class MusicTest < TestBase
  def test_to_filename
    song = Song.create(title: 'test song', filename: 'test song.mp3', hash: 'a62d12e', length: 420)
    assert song.to_filename == 'Unknown Artist/Unknown Album/test song.mp3'

    artist = Artist.create(name: 'test artist')
    album = Album.create(title: 'test*album', artist: artist)
    song.update(artist: artist, album: album)
    assert song.to_filename == 'test artist/test album/test song.mp3'

    song.update(track_num: 5)
    assert song.to_filename == 'test artist/test album/05 test song.mp3'

    p song.artist
  end

  def test_create_from_file
    p Song.create_from_file("#{ROOT}/storage/temp/07 Never Let Go.mp3")
  end
end
