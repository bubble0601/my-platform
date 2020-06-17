require 'digest/md5'
require './lib/music/audio'

# Columns
#   - common
#   id, created_at, updated_at
#   - relation
#   artist_id, album_id
#   - fields
#   title:        varchar(255)
#   filename:     varchar(255)
#   digest:       varchar(255)
#   track_num:    int
#   disc_num:     int
#   length:       int
#   rate:         int
#   has_artwork:  tinyint
#   has_lyric:    tinyint
class Song < Sequel::Model(:songs)
  many_to_one :album, order: %i[year title]
  many_to_one :artist, order: %i[name]
  many_to_many :playlists

  def self.create_from_file(path, filename = nil)
    filename ||= File.basename(path)
    audio = Audio.load(path)

    song, album, artist = TagUtil.load_metadata_from_file(audio)

    unless song.title
      ext = File.extname(filename)
      song.title = File.basename(filename, ext)
    end

    associate_relations(song, album, artist)
    return nil if Song.exists?(song)

    song.length = audio.info.length
    song.filename = song.generate_filename(filename)
    FileUtils.mkdir_and_move(path, song.path)
    song.digest = song.generate_digest
    song.save
  end

  def self.associate_relations(song, album, artist)
    if artist.name
      song.artist = Artist.find_or_create(name: artist.name)
      song.artist_name = artist.name unless song.artist_name
      album.artist_id = song.artist.id
    end
    if album.artist_id && album.title
      song.album = Album.find_or_create(album.to_hash.slice(:artist_id, :title))
      %i[year num_tracks num_discs].each do |k|
        song.album[k] = album[k] if album[k]
      end
    end
  end

  def self.exists?(song)
    q = Song.where(title: song.title)
    q = q.where(artist_id: song.artist.id) if song.artist
    q = q.where(album_id: song.album.id) if song.album
    !q.first.nil?
  end

  # generates unique digest (Used when create or update file)
  def generate_digest
    Digest::MD5.file(path).update(DateTime.now.strftime('%Y%m%d_%H%M%S%L')).hexdigest[0, 10]
  end

  # generates path after CONF.storage.music
  def generate_filename(original_name = nil)
    filename = original_name || self.filename
    raise unless filename

    ext = File.extname(filename)
    artist = self.artist&.name&.escape_filename || 'Unknown Artist'
    album = self.album&.title&.escape_filename || 'Unknown Album'
    title = "#{self.title&.escape_filename}#{ext}" || original_name || "Unknown Song#{ext}"

    if track_num
      if self.album && self.album.num_discs > 1
        format("#{artist}/#{album}/%d-%02d #{title}", self.album.num_discs, track_num)
      else
        format("#{artist}/#{album}/%02d #{title}", track_num)
      end
    else
      "#{artist}/#{album}/#{title}"
    end
  end

  # returns path includes CONF.storage.music (Either absolute or relative)
  def path
    "#{CONF.storage.music}/#{filename}"
  end

  def update_lyrics(lyrics)
    TagUtil.set_tags(path, { lyrics: lyrics })
    self.has_lyric = true
    self.digest = generate_digest
    self.save
  end

  def update_artwork(mime, data)
    TagUtil.set_tags(path, { artwork: { mime: mime, data: data } })
    self.has_artwork = true
    self.digest = generate_digest
    self.save
  end

  def regenerate
    filename = File.basename(path)
    audio = Audio.load(path)
    song, album, artist = TagUtil.load_metadata_from_file(audio)

    unless song.title
      ext = File.extname(filename)
      song.title = File.basename(filename, ext)
    end

    Song.associate_relations(song, album, artist)

    song.filename = song.generate_filename(filename)
    FileUtils.mkdir_and_move(self.path, song.path)

    song.digest = song.generate_digest
    self.update(song.to_hash)
  end

  def replace_file(new_path)
    TagUtil.copy_tags(path, new_path)
    self.filename = generate_filename(new_path)
    FileUtils.move(new_path, path)
    self.length = Audio.load(path).info.length
    self.digest = generate_digest
    self.save
  end
end
