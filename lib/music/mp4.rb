require_relative 'audio'

module MP4Tags
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

  def delete(key)
    self[key] = []
  end

  def type
    'Apple iTunes metadata'
  end

  define_text_tags  title: "\u00a9nam",
                    artist: "\u00a9ART",
                    artist_sort: 'soar',
                    album: "\u00a9alb",
                    album_artist: 'aART',
                    album_artist_sort: 'soaa',
                    year: "\u00a9day",
                    genre: "\u00a9gen",
                    lyrics: "\u00a9lyr"

  def track
    self['trkn'][0].to_a.join('/')
  rescue PyCall::PyError
    nil
  end

  def track=(value)
    r = value.split('/').map(&:to_i)
    raise ArgumentError unless r.length == 2

    self['trkn'] = [PyCall::Tuple.call(r)]
  end

  def disc
    self['disk'][0].to_a.join('/')
  rescue PyCall::PyError
    nil
  end

  def disc=(value)
    r = value.split('/').map(&:to_i)
    raise ArgumentError unless r.length == 2

    self['disk'] = [PyCall.tuple(r)]
  end

  def picture
    pic = self['covr'][0]
    mime =  case pic.imageformat
            when Mutagen::MP4Cover.FORMAT_JPEG then 'image/jpeg'
            when Mutagen::MP4Cover.FORMAT_PNG then 'image/png'
            end
    {
      mime: mime,
      data: PyCall::List.new(pic).to_a.pack('C*'),
    }
  rescue PyCall::PyError => e
    nil
  end

  def picture=(value)
    case value[:mime]
    when 'image/jpeg'
      type = Mutagen::MP4Cover.FORMAT_JPEG
    when 'image/png'
      type = Mutagen::MP4Cover.FORMAT_PNG
    else
      raise ArgumentError
    end
    self['covr'] = [Mutagen::MP4Cover.new(value[:data], imageformat: type)]
  end
end

class MP4 < Audio
  def initialize(path)
    @path = path
    @audio = Mutagen::MP4.new(path)
    @tags = @audio.tags
    return unless @tags

    @tags.extend MP4Tags
  end

  def add_tags
    @audio.add_tags
    @tags = @audio.tags
    @tags.extend MP4Tags
  end

  def codec_info
    "MPEG-4 audio (#{info.codec_description})"
  end
end
