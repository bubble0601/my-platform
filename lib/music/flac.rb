# flac is not supported on browser

require_relative 'audio'

module VorbisComment
  include AudioTags
  class << self
    def define_text_tags(**tags)
      tags.each do |key, tag|
        # get
        define_method(key) do
          self[tag][0]
        rescue PyCall::PyError
          nil
        end
        # set/del
        define_method(:"#{key}=") do |value|
          if value
            self[tag] = [value]
          else
            self[tag] = []
          end
        end
      end
    end
  end

  def type
    'Vorbis Comment'
  end

  def delete(key)
    self[key] = []
  end

  define_text_tags  title: 'titile',
                    artist: 'artist',
                    artist_sort: 'artistsort',
                    album: 'album',
                    album_artist: 'albumartist',
                    album_artist_sort: 'albumartistsort',
                    year: 'date',
                    genre: 'genre',
                    track: 'tracknumber',
                    disc: 'discnumber',
                    lyrics: 'lyrics'
end

class FLAC < Audio
  def initialize(path)
    @path = path
    @audio = Mutagen::FLAC.new(path)
    @tags = @audio.tags
    return unless @tags

    @tags.extend VorbisComment
    define_picture_methods
  end

  def add_tags
    @audio.add_tags
    @tags = @audio.tags
    @tags.extend VorbisComment
    define_picture_methods
  end

  def save_tags
    @audio.save
  end

  def define_picture_methods
    audio = @audio

    @tags.define_singleton_method(:picture) do
      pic = audio.pictures[0]
      {
        mime: pic.mime,
        data: pic.data,
      }
    rescue PyCall::PyError
      nil
    end

    @tags.define_singleton_method(:picture=) do |value|
      audio.clear_pictures
      return unless value

      picture = Mutagen::Picture.new
      picture.type = Mutagen::PictureType.COVER_FRONT
      picture.mime = '' + value[:mime] # なぜかこうしないとbytes型に変換されてしまう
      picture.desc = 'Cover'
      picture.data = value[:data]
      audio.add_picture(picture)
    end
  end

  def codec_info
    'FLAC'
  end
end
