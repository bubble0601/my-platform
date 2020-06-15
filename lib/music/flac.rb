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

  define_text_tags  title: 'TITLE',
                    artist: 'ARTIST',
                    artist_sort: 'ARTISTSORT',
                    album: 'ALBUM',
                    album_artist: 'ALBUMARTIST',
                    album_artist_sort: 'ALBUMARTISTSORT',
                    year: 'DATE',
                    genre: 'GENRE',
                    track: 'TRACKNUMBER',
                    disc: 'DISCNUMBER',
                    lyrics: 'LYRICS'
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

  def define_picture_methods
    @tags.define_singleton_method(:picture, method(:picture))
    @tags.define_singleton_method(:picture=, method(:picture=))
  end

  def picture
    pic = pictures[0]
    {
      mime: pic.mime,
      data: pic.data,
    }
  rescue PyCall::PyError
    nil
  end

  def picture=(value)
    clear_pictures
    picture = Mutagen::Picture.new({
      type: Mutagen::PictureType.COVER_FRONT,
      mime: value[:mime],
      desc: 'Cover',
      data: value[:data],
    })
    add_picture(picture)
  end

  def codec_info
    'FLAC'
  end
end
