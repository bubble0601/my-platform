require 'digest/md5'
require './lib/music/audio'

using Sequel::CoreRefinements
using Sequel::SymbolAref

# Columns
#   id:                   bigint, PRIMARY KEY, AUTO INCREMENT, NOT NULL
#   created_at:           datetime
#   updated_at:           datetime
#   filename:             varchar(255), NOT NULL
#   digest:               varchar(255), NOT NULL
#   title:                varchar(255), NOT NULL
#   artist_name:          varchar(255)
#   artist_id:            bigint
#   album_id:             bigint
#   track_num:            int
#   disc_num:             int, DEFAULT 1
#   has_cover_art:        tinyint(1), NOT NULL, DEFAULT 0
#   has_lyrics:           tinyint(1), NOT NULL, DEFAULT 0
#   length:               int, NOT NULL
#   rating:               int, NOT NULL, DEFAULT 0
#   synced_played_count:  int, NOT NULL
#   enabled:              tinyint(1), NOT NULL, DEFAULT 1
#   year:                 int
#   played_count:         int, NOT NULL
#   played_at:            datetime
class Song < Sequel::Model(:songs)
  many_to_one :album
  many_to_one :artist
  many_to_many :playlists

  dataset_module do
    def default_order
      order(Sequel.lit('songs.artist_id is NULL asc'))
        .order_append(:artist[:ruby])
        .order_append(:artist[:name])
        .order_append(:album[:year])
        .order_append(:disc_num)
        .order_append(:track_num)
        .order_append(:songs[:title])
    end
  end

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
    else
      song.artist = nil
    end
    if album.artist_id && album.title
      song.album = Album.find_or_create(album.to_hash.slice(:artist_id, :title))
      %i[year track_count disc_count].each do |k|
        song.album[k] = album[k] if album[k]
      end
      song.album.save
    else
      song.album = nil
    end
  end

  def self.exists?(song)
    q = Song.where(title: song.title)
    q = q.where(artist_id: song.artist.id) if song.artist
    q = q.where(album_id: song.album.id) if song.album
    !q.empty?
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
      if self.album && self.album.disc_count > 1
        format("#{artist}/#{album}/%d-%02d #{title}", disc_num, track_num)
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
    if lyrics.nil? || lyrics.empty?
      TagUtil.set_tags(path, { lyrics: nil })
      self.has_lyrics = false
    else
      TagUtil.set_tags(path, { lyrics: lyrics })
      self.has_lyrics = true
    end
    self.digest = generate_digest
    self.save
  end

  def update_cover_art(mime, data)
    TagUtil.set_tags(path, { cover_art: { mime: mime, data: data } })
    self.has_cover_art = true
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
