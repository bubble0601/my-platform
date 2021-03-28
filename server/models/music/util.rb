require './lib/music/audio'

module TagUtil
  module_function

  def set_tags(filename, data)
    audio = Audio.load(filename)
    audio.add_tags unless audio.tags
    tags = audio.tags

    errors = []
    data.each do |k, v|
      case k
      when :cover_art
        tags.picture = data[:cover_art]
      else
        tags.method(:"#{k}=").call(v)
      end
    rescue ArgumentError => e
      errors.push({ err: e.to_s, key: k, val: v })
      next
    end
    audio.save_tags
    errors
  end

  def copy_tags(src, dist)
    src_audio = Audio.load(src)
    src_tags = src_audio.tags
    return unless src_tags

    dist_audio = Audio.load(dist)
    dist_audio.add_tags unless dist_audio.tags
    dist_tags = dist_audio.tags

    if src_tags.type == dist_tags.type
      src_tags.each do |key, value|
        dist_tags[key] = value
      end
    else
      %i[title artist album_artist album_artist_sort album year track disc genre lyrics picture].each do |key|
        value = src_tags.method(key).call
        dist_tags.method(:"#{key}=").call(value) if value
      rescue ArgumentError, PyCall::PyError => e
        logger.error('copy_tags'){ e.message }
        next
      end
    end

    dist_audio.save_tags
  end

  def delete_tags(filename, keys)
    tags = Audio.load(filename).tags
    keys.each do |k|
      tags.delete(k)
    end
  end

  def load_song_from_tags(tags)
    song = Song.new
    song.title = tags.title
    song.artist_name = tags.artist

    track_num, = tags.track&.split('/')&.map(&:to_i)
    song.track_num = track_num if track_num&.positive?

    disc_num, = tags.disc&.split('/')&.map(&:to_i)
    song.disc_num = disc_num if disc_num&.positive?

    song.has_lyrics= true if tags.lyrics
    song.has_cover_art = true if tags.picture

    song
  end

  def load_album_from_tags(tags)
    album = Album.new
    album.title = tags.album

    year = tags.year.to_i
    album.year = year if year&.positive?

    _, track_count = tags.track&.split('/')&.map(&:to_i)
    album.track_count = track_count if track_count&.positive?

    _, disc_count = tags.disc&.split('/')&.map(&:to_i)
    album.disc_count = disc_count if disc_count&.positive?

    album
  end

  def load_artist_from_tags(tags)
    artist = Artist.new
    artist.name = tags.album_artist || tags.artist
    artist.ruby = tags.album_artist_sort || tags.artist_sort
    artist
  end

  def load_metadata_from_file(audio)
    tags = audio.tags
    return unless tags

    song = load_song_from_tags(tags)
    album = load_album_from_tags(tags)
    artist = load_artist_from_tags(tags)

    [song, album, artist]
  end
end
