require 'digest/md5'
require 'fileutils'
require_relative 'utils/mp3'

class Song < Sequel::Model(:songs)
  many_to_one :album, order: [:year, :title]
  many_to_one :artist, order: [:name]
  many_to_many :playlists

  def self.fix_mp3(filename)
    # deprecated
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

  def self.set_tags(filename, data, delete: false)
    return if data.nil?
    tags = MP3.new(filename).tags
    tags.update_to_v24
    tags.delete_tag('TSSE')
    tags.title = data[:title] if data[:title]
    tags.artist = data[:artist] if data[:artist]
    tags.album_artist = data[:album_artist] if data[:album_artist]
    tags.album = data[:album] if data[:album]
    tags.year = data[:year] if data[:year]
    tags.track = data[:track] if data[:track]
    tags.disc = data[:disc] if data[:disc]
    tags.lyrics = data[:lyrics] if data[:lyrics]
    if data[:artwork]
      tags.picture = {
        mime: data[:artwork][:mime],
        data: data[:artwork][:data],
      }
    end
    tags.save
  end

  def self.load_from_tags(tags)
    song = Song.new
    album = Album.new
    artist = Artist.new
    tags.each do |key, val|
      case key
      when 'TIT2' # Title
        song.title = val
      when 'TPE1' # Artist
        song.artist_name = val
      when 'TPE2' # Album artist
        artist.name = val
      when 'TALB' # Album
        album.title = val
      when 'TDRC' # Year
        album.year = val.to_i if val.to_i > 0
      when 'TRCK' # Track number
        values = val.split('/')
        if values.length == 1
          song.track_num = val.to_i if val.to_i > 0
        else # values.length > 1
          n = values[0].to_i
          total = values[1].to_i
          song.track_num = n if n > 0
          album.num_tracks = total if total > 0
        end
      when 'TPOS' # Disc number
        values = val.split('/')
        if values.length == 1
          song.disc_num = val.to_i if val.to_i > 0
        else # values.length > 1
          n = values[0].to_i
          total = values[1].to_i
          song.disc_num = n if n > 0
          album.num_discs = total if total > 0
        end
      when 'USLT' # Lyrics
        song.has_lyric = true
      when 'APIC' # Cover art
        song.has_artwork = true
      end
    end
    [song, album, artist]
  end

  def self.create_from_file(path, filename=nil)
    filename ||= File.basename(path)
    # load id3 tag
    mp3 = MP3.new(path)
    tags = mp3.tags
    tags.update_to_v24

    # load tags
    song, album, artist = load_from_tags(tags)

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
        [:year, :num_tracks, :num_discs].each{|k|
          song.album[k] = album[k] if song.album[k].nil? and album[k]
        }
      else
        song.album = album.save
      end
    end

    song.length = mp3.length
    song.filename = song.to_filename(filename)
    song

    song.digest = Digest::MD5.file(path).hexdigest[0,8]

    new_filename = "#{CONF.storage.music}/#{song.filename}"
    if File.exist?(new_filename) and Song.first(artist_name: song.artist_name, title: song.title) != nil
      return nil
    end
    if File.realpath(path) != new_filename
      dir = File.dirname(new_filename)
      FileUtils.mkdir_p(dir) unless Dir.exist?(dir)
      File.rename(path, new_filename)
    end
    song.save
  end

  def self.get_path(digest, name)
    song = self.first(digest: digest)
    return if song.nil?
    return if File.basename(song.filename) != name
    "#{CONF.storage.music}/#{song.to_filename}"
  end

  def update_tag(new_tags)
    path = self.to_fullpath
    tags = MP3.new(path).tags
    new_tags.each do |k, v|
      case k
      when 'TYER'
        tags['TDRC'] = v
      else
        tags[k] = v
      end
    end
    tags.save

    self.digest = Digest::MD5.file(path).hexdigest[0,8]

    song, album, artist = self.class.load_from_tags(new_tags)

    if artist.name == nil
      self.artist = nil
    elsif self.artist&.name != artist.name
      self.artist = Artist.first(artist.to_hash) || artist.save
      self.artist_name = artist.name unless self.artist_name or song.artist_name
      if self.album and self.album.title == album.title
        self.album.artist_id = self.artist.id
      end
    end
    album.artist_id = self.artist&.id

    if album.title == nil
      self.album = nil
    elsif album.artist_id == nil
      # nop
    elsif self.album&.title != album.title
      _album = Album.first(album.slice(:artist_id, :title))
      if _album
        self.album = _album
        [:year, :num_tracks, :num_discs].each{|k|
          self.album[k] = album[k] if album[k]
        }
      else
        self.album = album.save
      end
    elsif self.album
      self.album.update(album.to_hash)
    end

    [:title, :artist_name, :track_num, :disc_num].each{|k|
      self[k] = song[k] if song[k]
    }

    if self.filename != self.to_filename
      self.filename = self.to_filename
      new_filename = "#{CONF.storage.music}/#{self.filename}"
      dir = File.dirname(new_filename)
      FileUtils.mkdir_p(dir) unless Dir.exist?(dir)
      File.rename(path, new_filename)
    end

    self.save
    self.update(song.to_hash)
  end

  def fix
    self.class.fix_mp3(self.to_fullpath)
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

  def to_fullpath
    "#{CONF.storage.music}/#{self.filename}"
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

class Playlist < Sequel::Model(:playlists)
  many_to_many :songs
end

class PlaylistSong < Sequel::Model(:playlists_songs)
  many_to_one :playlists
  many_to_one :songs
end
