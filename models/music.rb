require 'mp3info'
require 'digest/md5'
require 'fileutils'

class Song < Sequel::Model(:songs)
  many_to_one :album
  many_to_one :artist

  def self.to_id3v2(mp3)
    # to ID3v2.3
    if mp3.hastag1?
      mp3.tag1.each do |key, val|
        frame = Mp3Info::TAG_MAPPING_2_3[key]
        next if mp3.tag2.has_key?(frame)
        mp3.tag2[frame] = val
      end
      mp3.removetag1
    end
  end

  def self.set_tags(filename, data)
    return if data.nil?
    Mp3Info.open(filename) do |mp3|
      self.to_id3v2(mp3)

      mp3.tag2.TIT2 = data[:title] if data[:title]
      mp3.tag2.TPE1 = data[:artist] if data[:artist]
      mp3.tag2.TPE2 = data[:album_artist] if data[:album_artist]
      mp3.tag2.TALB = data[:album] if data[:album]
      mp3.tag2.TYER = data[:year] if data[:year]
      mp3.tag2.TRCK = data[:track_num] if data[:track_num]
      mp3.tag2.TPOS = data[:disc_num] if data[:disc_num]
      mp3.tag2.USLT = data[:lyrics] if data[:lyrics]
      if data[:artwork]
        mp3.tag2.remove_pictures
        mp3.tag2.add_picture(data[:artwork])
      end
    end
    # MP3Infoのtagの保存に一部不具合あり
    # ffmpegやchromeで見たときにbitrateがおかしくなり、再生時間が正しく取得できない
    # なのでffmpegで書き直して修正
    tmp = "#{filename}.tmp.mp3"
    out = `ffmpeg -i #{filename.escape_shell} -c copy #{tmp.escape_shell}`
    unless $?.success?
      File.delete(tmp)
      raise "failed: #{out}"
    end
    File.rename(tmp, filename)
  end

  def self.create_from_file(path, filename=nil)
    filename ||= File.basename(path)
    # load id3 tag
    song = Mp3Info.open(path) do |mp3|
      self.to_id3v2(mp3)

      # load tags
      song = Song.new
      album = Album.new
      artist = Artist.new
      mp3.tag2.each do |key, val|
        case key
        when 'TIT2' # Title
          song.title = val
        when 'TPE1' # Artist
          song.artist_name = val
        when 'TPE2' # Album artist
          artist.name = val
        when 'TALB' # Album
          album.title = val
        when 'TYER' # Year
          album.year = val.to_i if val.to_i > 0
        when 'TRCK' # Track number
          values = val.split('/')
          if values.length == 1
            song.track_num = val.to_i if val.to_i > 0
          else # values.length > 1
            n = values[0].to_i
            total = values[1].to_i
            song.track_num = n if n > 0
            album.track_count = total if total > 0
          end
        when 'TPOS' # Disc number
          values = val.split('/')
          if values.length == 1
            song.disc_num = val.to_i if val.to_i > 0
          else # values.length > 1
            n = values[0].to_i
            total = values[1].to_i
            song.disc_num = n if n > 0
            album.disc_count = total if total > 0
          end
        when 'USLT' # Lyrics
          song.has_lyric = true
        when 'APIC' # Cover art
          song.has_artwork = true
        end
      end

      unless song.title
        ext = File.extname(filename)
        song.title = File.basename(filename)[%r((.*)#{ext}), 1]
      end

      if artist.name
        song.artist = Artist.first(artist.to_hash) || artist.save
        song.artist_name = artist.name unless song.artist_name
        album.artist_id = song.artist.id
      end


      if album.artist_id and album.title
        song.album = Album.first(album.to_hash.slice(:artist_id, :title))
        if song.album
          [:year, :track_count, :disc_count].each{|k|
            song.album[k] = album[k] if song.album[k].nil? and album[k]
          }
        else
          song.album = album.save
        end
      end

      song.length = mp3.length
      song.filename = song.to_filename(filename)
      song
    end
    song.digest = Digest::MD5.file(path).hexdigest[0,8]

    new_filename = "#{ROOT}/#{CONF.storage.music}/#{song.filename}"
    dir = File.dirname(new_filename)
    FileUtils.mkdir_p(dir) unless Dir.exist?(dir)
    File.rename(path, new_filename)

    song.save
  end

  def self.get_path(digest, name)
    song = self.first(digest: digest)
    return if song.nil?
    return if File.basename(song.filename) != name
    "#{CONF.storage.music}/#{song.to_filename}"
  end

  def to_filename(original_name = nil)
    artist = self.artist&.name&.escape_filename || 'Unknown Artist'
    album = self.album&.title&.escape_filename || 'Unknown Album'
    title = "#{self.title&.escape_filename}.mp3" || original_name || 'Unknown Song.mp3'
    if self.track_num
      "#{artist}/#{album}/%02d #{title}" % self.track_num
    else
      "#{artist}/#{album}/#{title}"
    end
  end
end

class Album < Sequel::Model(:albums)
  one_to_many :songs
  many_to_one :artist
end

class Artist < Sequel::Model(:artists)
  one_to_many :songs
  one_to_many :albums
end
