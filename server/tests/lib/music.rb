require './lib/music/audio'
require_relative 'init'

MP3_FILE = 'storage/tests/sample.mp3'.freeze
M4A_FILE = 'storage/tests/sample.m4a'.freeze
AAC_FILE = 'storage/tests/sample.aac'.freeze

class TestMP3 < TestBase
  def setup
    @mp3 = Audio.load(MP3_FILE)
  end

  def test_length
    expected = `python -c "from mutagen.mp3 import MP3; print(MP3('#{MP3_FILE}').info.length, end='')"`
    assert_equal @mp3.info.length.to_s, expected
  end

  def test_info
    puts "\n", @mp3.info.pprint
  end

  def test_tags
    tags = @mp3.tags
    assert_equal tags.artist, '美波'
    assert_equal tags.title, 'カワキヲアメク'
    assert_equal tags.title, tags['TIT2'].text[0]
    assert_equal tags.title, tags.getall('TIT2')[0].text[0]
    tags.title = 'abc'
    assert_equal tags.title, 'abc'

    assert_equal tags.v2_version, 4

    tags.each do |k, v|
      assert_equal v, tags[k]
    end

    tags.title = nil
    assert_nil tags.title

    tags.setall('USLT', [Mutagen::Frames::USLT.new(encoding: Mutagen::Encoding.UTF8, lang: 'jpn', text: 'abc')])
    assert_equal tags['USLT::jpn'].to_s, 'abc'
    assert_equal tags.lyrics, 'abc'
    tags.delall('USLT::jpn')
    p tags.getall('USLT')

    assert_nil tags.lyrics
    tags['USLT'] = Mutagen::Frames::USLT.new(encoding: Mutagen::Encoding.UTF8, lang: 'eng', text: 'def')
    tags.delall('USLT::eng')
    p tags.getall('USLT')
  end
end

class TestMP4 < TestBase
  def setup
    @mp4 = Audio.load(M4A_FILE)
  end

  def test_info
    puts "\n", @mp4.info.pprint
  end

  def test_tags
    tags = @mp4.tags
    assert_equal tags.artist, '美波'
    assert_equal tags.title, 'Prologue'
    assert_equal tags.album_artist, tags['aART'][0]
    tags.title = 'abc'
    assert_equal tags.title, 'abc'

    tags.each do |k, v|
      assert_equal v, tags[k]
    end

    tags.title = nil
    assert_nil tags.title

    tags.lyrics = 'a'
    assert_equal tags.lyrics, 'a'

    tags.track = '1/5'
    assert_equal tags.track, '1/5'
    assert_raises(PyCall::PyError, ArgumentError) do
      tags.track = '2'
    end

    assert tags.key?('trkn')
    assert !tags.key?('covr')

    tags.picture = {
      mime: 'image/jpeg',
      data: Random.new.bytes(100),
    }
    p tags.picture
  end
end

class TestAAC < TestBase
  def setup
    @aac = Audio.load(AAC_FILE)
    @aac.delete_tags
    @aac.add_tags
    @aac.tags.title = 'カワキヲアメク'
    @aac.tags.artist = '美波'
    @aac.tags.save
  end

  def test_info
    puts "\n", @aac.info.pprint
  end

  def test_tags
    tags = @aac.tags
    assert_equal tags.artist, '美波'
    assert_equal tags.title, 'カワキヲアメク'
    assert_equal tags.title, tags['TIT2'].text[0]
    assert_equal tags.title, tags.getall('TIT2')[0].text[0]
    tags.title = 'abc'
    assert_equal tags.title, 'abc'

    assert_equal tags.v2_version, 4

    tags.each do |k, v|
      assert_equal v, tags[k]
    end

    tags.title = nil
    assert_nil tags.title

    tags.setall('USLT', [Mutagen::Frames::USLT.new(encoding: Mutagen::Encoding.UTF8, lang: 'jpn', text: 'abc')])
    assert_equal tags['USLT::jpn'].to_s, 'abc'
    assert_equal tags.lyrics, 'abc'
    tags.delall('USLT::jpn')
    p tags.getall('USLT')

    assert_nil tags.lyrics
    tags['USLT'] = Mutagen::Frames::USLT.new(encoding: Mutagen::Encoding.UTF8, lang: 'eng', text: 'def')
    tags.delall('USLT::eng')
    p tags.getall('USLT')
  end
end

class TestFLAC < TestBase
  # def setup
  #   @flac = Audio.load(FLAC_FILE)
  # end

  # def test_info
  #   puts "\n", @flac.info.pprint
  # end

  # def test_tags
  #   tags = @flac.tags
  # end
end
